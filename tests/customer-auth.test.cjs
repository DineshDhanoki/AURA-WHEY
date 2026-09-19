const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const authModule = import('../api/_lib/customer-auth.js');

function responseFixture() {
  const headers = new Map();
  return {
    setHeader(name, value) { headers.set(name.toLowerCase(), value); },
    getHeader(name) { return headers.get(name.toLowerCase()); },
    headers,
  };
}

function requestFromSetCookies(setCookies) {
  const cookieHeader = setCookies.map(value => value.split(';')[0]).join('; ');
  return { headers: { cookie: cookieHeader } };
}

test('encrypted auth values round-trip and reject tampering', async () => {
  const { seal, unseal } = await authModule;
  const secret = 'a-secure-test-secret-that-is-long-enough';
  const sealed = seal({ accessToken: 'private-token', expiresAt: 123 }, secret);
  assert.ok(!sealed.includes('private-token'));
  assert.deepEqual(unseal(sealed, secret), { accessToken: 'private-token', expiresAt: 123 });
  const tampered = `${sealed.slice(0, -1)}${sealed.endsWith('A') ? 'B' : 'A'}`;
  assert.equal(unseal(tampered, secret), null);
});

test('customer session cookies are secure, HttpOnly, chunkable and readable', async () => {
  const { readSession, setSessionCookies } = await authModule;
  const response = responseFixture();
  const secret = 'another-secure-test-secret-that-is-long';
  const session = { accessToken: 'a'.repeat(5000), refreshToken: 'refresh', idToken: 'identity', expiresAt: Date.now() + 60_000 };
  setSessionCookies(response, session, secret);
  const cookies = response.getHeader('Set-Cookie');
  assert.ok(cookies.length > 2, 'large encrypted sessions are split across cookies');
  assert.ok(cookies.every(value => /HttpOnly/.test(value) && /Secure/.test(value) && /SameSite=Lax/.test(value)));
  assert.deepEqual(readSession(requestFromSetCookies(cookies), secret), session);
});

test('live account page uses real auth endpoints and does not contain the demo password form', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.ok(app.includes('/api/auth/login'));
  assert.ok(app.includes('/api/auth/logout'));
  assert.ok(app.includes('/api/auth/session'));
  assert.ok(!app.includes('Connect this form to Shopify customer accounts'));
  assert.ok(!app.includes('data-form="account"'));
  assert.ok(!app.includes('name="password"'));
});

test('authentication does not clear or replace the persisted Shopify cart', () => {
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const authStart = app.indexOf('async function initCustomerAccount()');
  const authEnd = app.indexOf('\nfunction navigate(', authStart);
  const authCode = app.slice(authStart, authEnd);
  assert.ok(app.includes("const cartStorageKey = 'aura-shopify-cart:' + SHOPIFY_CONFIG.domain"));
  assert.ok(!authCode.includes('localStorage'));
  assert.ok(!authCode.includes('acceptCart'));
  assert.ok(!authCode.includes('state.cart'));
});

test('private customer credentials are read only from server environment variables', () => {
  const clientFiles = ['app.js', 'shopify.js', 'index.html'].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  assert.ok(!clientFiles.includes('SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET'));
  assert.ok(!clientFiles.includes('AUTH_SESSION_SECRET'));
  const helper = fs.readFileSync(path.join(root, 'api/_lib/customer-auth.js'), 'utf8');
  assert.ok(helper.includes("required('SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET')"));
  assert.ok(helper.includes("required('AUTH_SESSION_SECRET')"));
});

test('production callback configuration is read from the environment and requires HTTPS', async () => {
  const { authConfig } = await authModule;
  const previous = Object.fromEntries(['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID', 'SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET', 'SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL', 'SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL', 'AUTH_SESSION_SECRET'].map(name => [name, process.env[name]]));
  Object.assign(process.env, {
    SHOPIFY_STORE_DOMAIN: 'cay9kn-xc.myshopify.com',
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: 'test-client-id',
    SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET: 'test-client-secret',
    SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL: 'https://www.aurawhey.in/api/auth/callback',
    SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_URL: 'https://www.aurawhey.in/',
    AUTH_SESSION_SECRET: 'test-session-secret-with-at-least-32-bytes',
  });
  try {
    assert.equal(authConfig().callbackUrl, 'https://www.aurawhey.in/api/auth/callback');
    process.env.SHOPIFY_CUSTOMER_ACCOUNT_CALLBACK_URL = 'http://www.aurawhey.in/api/auth/callback';
    assert.throws(() => authConfig(), /must use HTTPS/);
  } finally {
    for (const [name, value] of Object.entries(previous)) value === undefined ? delete process.env[name] : process.env[name] = value;
  }
});

test('ID tokens require a valid Shopify signature, issuer, audience, expiry and nonce', async () => {
  const { verifyIdToken } = await authModule;
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = publicKey.export({ format: 'jwk' });
  jwk.kid = 'test-key';
  jwk.alg = 'RS256';
  const discovery = { issuer: 'https://shopify.com/authentication/test-shop', jwks_uri: 'https://shopify.test/jwks' };
  const config = { clientId: 'customer-client-id' };
  const nonce = 'expected-nonce';
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const makeToken = overrides => {
    const header = encode({ alg: 'RS256', kid: jwk.kid, typ: 'JWT' });
    const payload = encode({ iss: discovery.issuer, aud: config.clientId, exp: Math.floor(Date.now() / 1000) + 300, iat: Math.floor(Date.now() / 1000), nonce, ...overrides });
    const data = `${header}.${payload}`;
    return `${data}.${crypto.sign('RSA-SHA256', Buffer.from(data), privateKey).toString('base64url')}`;
  };
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, json: async () => ({ keys: [jwk] }) });
  try {
    assert.equal((await verifyIdToken(makeToken({}), discovery, config, nonce)).nonce, nonce);
    await assert.rejects(verifyIdToken(makeToken({ nonce: 'wrong' }), discovery, config, nonce), /validation failed/);
    await assert.rejects(verifyIdToken(makeToken({ aud: 'wrong-client' }), discovery, config, nonce), /validation failed/);
    await assert.rejects(verifyIdToken(makeToken({ exp: Math.floor(Date.now() / 1000) - 1 }), discovery, config, nonce), /validation failed/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('.env.example contains placeholders rather than customer-account secrets', () => {
  const example = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
  assert.match(example, /SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=your-customer-account-client-id/);
  assert.match(example, /SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=your-customer-account-client-secret/);
  assert.match(example, /AUTH_SESSION_SECRET=replace-with-at-least-32-random-bytes/);
});
