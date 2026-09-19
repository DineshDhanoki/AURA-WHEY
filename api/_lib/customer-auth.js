import crypto from 'node:crypto';

const SESSION_COOKIE = 'aura_customer_session';
const SESSION_COUNT_COOKIE = `${SESSION_COOKIE}_count`;
const OAUTH_COOKIE = 'aura_customer_oauth';
const COOKIE_CHUNK_SIZE = 3600;
const MAX_SESSION_CHUNKS = 6;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function authConfig() {
  const shopDomain = required('SHOPIFY_STORE_DOMAIN').replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/^[a-z0-9-]+\.myshopify\.com$/i.test(shopDomain)) throw new Error('SHOPIFY_STORE_DOMAIN must be a myshopify.com hostname.');
  const callbackUrl = required('SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL');
  const logoutUrl = required('SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL');
  const sessionSecret = required('AUTH_SESSION_SECRET');
  if (!callbackUrl.startsWith('https://') || !logoutUrl.startsWith('https://')) throw new Error('Customer account callback and logout URLs must use HTTPS.');
  if (Buffer.byteLength(sessionSecret) < 32) throw new Error('AUTH_SESSION_SECRET must contain at least 32 bytes.');
  return {
    shopDomain,
    clientId: required('SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID'),
    clientSecret: required('SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET'),
    callbackUrl,
    logoutUrl,
    sessionSecret,
  };
}

function parseCookies(request) {
  return Object.fromEntries(String(request.headers.cookie || '').split(';').map(value => value.trim()).filter(Boolean).map(value => {
    const separator = value.indexOf('=');
    return separator < 0 ? [value, ''] : [value.slice(0, separator), decodeURIComponent(value.slice(separator + 1))];
  }));
}

function cookie(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function encryptionKey(secret) {
  return crypto.createHash('sha256').update(secret).digest();
}

export function seal(value, secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}

export function unseal(value, secret) {
  if (!value) return null;
  try {
    const data = Buffer.from(value, 'base64url');
    if (data.length < 29) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(secret), data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    return JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8'));
  } catch {
    return null;
  }
}

function setCookies(response, values) {
  response.setHeader('Set-Cookie', values);
}

export function setOauthCookie(response, transaction, secret) {
  setCookies(response, [cookie(OAUTH_COOKIE, seal(transaction, secret), 600)]);
}

export function readOauthCookie(request, secret) {
  return unseal(parseCookies(request)[OAUTH_COOKIE], secret);
}

export function clearOauthCookieHeader() {
  return cookie(OAUTH_COOKIE, '', 0);
}

export function setSessionCookies(response, session, secret) {
  const sealed = seal(session, secret);
  const chunks = sealed.match(new RegExp(`.{1,${COOKIE_CHUNK_SIZE}}`, 'g')) || [];
  if (!chunks.length || chunks.length > MAX_SESSION_CHUNKS) throw new Error('The encrypted customer session is too large.');
  const headers = [cookie(SESSION_COUNT_COOKIE, String(chunks.length), 60 * 60 * 24 * 30)];
  chunks.forEach((chunk, index) => headers.push(cookie(`${SESSION_COOKIE}_${index}`, chunk, 60 * 60 * 24 * 30)));
  for (let index = chunks.length; index < MAX_SESSION_CHUNKS; index += 1) headers.push(cookie(`${SESSION_COOKIE}_${index}`, '', 0));
  setCookies(response, headers);
}

export function readSession(request, secret) {
  const cookies = parseCookies(request);
  const count = Number(cookies[SESSION_COUNT_COOKIE]);
  if (!Number.isInteger(count) || count < 1 || count > MAX_SESSION_CHUNKS) return null;
  const sealed = Array.from({ length: count }, (_, index) => cookies[`${SESSION_COOKIE}_${index}`] || '').join('');
  return unseal(sealed, secret);
}

export function clearSessionCookies(response) {
  const headers = [cookie(SESSION_COUNT_COOKIE, '', 0), clearOauthCookieHeader()];
  for (let index = 0; index < MAX_SESSION_CHUNKS; index += 1) headers.push(cookie(`${SESSION_COOKIE}_${index}`, '', 0));
  setCookies(response, headers);
}

export function randomUrlSafe(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export async function discoverAuth(shopDomain) {
  const response = await fetch(`https://${shopDomain}/.well-known/openid-configuration`, { headers: { Accept: 'application/json', 'User-Agent': 'Aura-Whey-Storefront' } });
  if (!response.ok) throw new Error('Unable to discover Shopify customer authentication endpoints.');
  return response.json();
}

export async function discoverCustomerApi(shopDomain) {
  const response = await fetch(`https://${shopDomain}/.well-known/customer-account-api`, { headers: { Accept: 'application/json', 'User-Agent': 'Aura-Whey-Storefront' } });
  if (!response.ok) throw new Error('Unable to discover Shopify Customer Account API endpoint.');
  const result = await response.json();
  if (!result.graphql_api) throw new Error('Shopify did not return a Customer Account GraphQL endpoint.');
  return result.graphql_api;
}

function basicAuth(config) {
  return `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`;
}

async function tokenRequest(config, endpoint, parameters) {
  const body = new URLSearchParams({ client_id: config.clientId, ...parameters });
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded', Authorization: basicAuth(config), 'User-Agent': 'Aura-Whey-Storefront' },
    body,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.access_token) throw new Error('Shopify customer authentication could not be completed.');
  return result;
}

export function exchangeAuthorizationCode(config, endpoint, code) {
  return tokenRequest(config, endpoint, { grant_type: 'authorization_code', code, redirect_uri: config.callbackUrl });
}

export function refreshCustomerToken(config, endpoint, refreshToken) {
  return tokenRequest(config, endpoint, { grant_type: 'refresh_token', refresh_token: refreshToken });
}

function decodeJwtPart(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

export async function verifyIdToken(idToken, discovery, config, expectedNonce) {
  const parts = String(idToken || '').split('.');
  if (parts.length !== 3) throw new Error('Shopify returned an invalid identity token.');
  const header = decodeJwtPart(parts[0]);
  const payload = decodeJwtPart(parts[1]);
  if (header.alg !== 'RS256' || !header.kid || !discovery.jwks_uri) throw new Error('Shopify returned an unsupported identity token.');
  const jwksResponse = await fetch(discovery.jwks_uri, { headers: { Accept: 'application/json', 'User-Agent': 'Aura-Whey-Storefront' } });
  if (!jwksResponse.ok) throw new Error('Unable to validate the Shopify identity token.');
  const jwk = (await jwksResponse.json()).keys?.find(key => key.kid === header.kid);
  if (!jwk) throw new Error('Shopify identity signing key was not found.');
  const valid = crypto.verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), crypto.createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  const now = Math.floor(Date.now() / 1000);
  if (!valid || payload.iss !== discovery.issuer || !audiences.includes(config.clientId) || payload.exp <= now || payload.iat > now + 60 || payload.nonce !== expectedNonce) {
    throw new Error('Shopify identity-token validation failed.');
  }
  return payload;
}

export function sessionFromToken(token) {
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token || '',
    idToken: token.id_token,
    expiresAt: Date.now() + (Number(token.expires_in || 300) * 1000),
  };
}

export async function activeSession(request, response) {
  const config = authConfig();
  let session = readSession(request, config.sessionSecret);
  if (!session?.accessToken) return { config, session: null };
  if (session.expiresAt > Date.now() + 60_000) return { config, session };
  if (!session.refreshToken) return { config, session: null };
  const discovery = await discoverAuth(config.shopDomain);
  const token = await refreshCustomerToken(config, discovery.token_endpoint, session.refreshToken);
  session = { ...sessionFromToken(token), refreshToken: token.refresh_token || session.refreshToken };
  setSessionCookies(response, session, config.sessionSecret);
  return { config, session };
}

export async function customerQuery(config, accessToken, query, variables = {}) {
  const endpoint = await discoverCustomerApi(config.shopDomain);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: accessToken, 'User-Agent': 'Aura-Whey-Storefront' },
    body: JSON.stringify({ query, variables }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.errors?.length) throw new Error('Unable to load the Shopify customer account.');
  return result.data;
}

export function noStore(response) {
  response.setHeader('Cache-Control', 'no-store, private');
  response.setHeader('Pragma', 'no-cache');
}
