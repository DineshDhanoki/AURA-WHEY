export const API_VERSION = '2026-07';

export class ShopifyAdminError extends Error {
  constructor(status, code, message = 'Shopify Admin request failed.') { super(message); this.status = status; this.code = code; }
}

const adminTokens = new Map();

export function clearAdminTokenCache() { adminTokens.clear(); }

async function acquireAdminToken(shopDomain) {
  const response = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: process.env.SHOPIFY_ADMIN_CLIENT_ID, client_secret: process.env.SHOPIFY_ADMIN_CLIENT_SECRET }),
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new ShopifyAdminError(502, 'shopify_auth_failed');
  const result = await response.json().catch(() => null);
  if (!result || typeof result.access_token !== 'string' || !result.access_token || !Number.isFinite(Number(result.expires_in))) throw new ShopifyAdminError(502, 'shopify_auth_invalid');
  const entry = { token: result.access_token, expiresAt: Date.now() + Math.max(1, Number(result.expires_in) - 60) * 1000 };
  adminTokens.set(shopDomain, entry);
  return entry.token;
}

async function adminToken(shopDomain, force = false) {
  const cached = adminTokens.get(shopDomain);
  if (!force && cached && cached.expiresAt > Date.now()) return cached.token;
  const pending = adminTokens.get(`${shopDomain}:pending`);
  if (pending) return pending;
  const request = acquireAdminToken(shopDomain).finally(() => adminTokens.delete(`${shopDomain}:pending`));
  adminTokens.set(`${shopDomain}:pending`, request);
  return request;
}

export async function adminQuery(config, query, variables) {
  const url = `https://${config.shopDomain}/admin/api/${API_VERSION}/graphql.json`;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = await adminToken(config.shopDomain, attempt === 1);
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(12000) });
    if ((response.status === 401 || response.status === 403) && attempt === 0) { adminTokens.delete(config.shopDomain); continue; }
    if (response.status === 429) throw new ShopifyAdminError(429, 'upstream_throttled', 'Please wait a moment before trying again.');
    if (!response.ok) throw new ShopifyAdminError(502, 'shopify_query_failed');
    const result = await response.json().catch(() => null);
    const throttled = result?.errors?.some(error => error.extensions?.code === 'THROTTLED');
    if (throttled) throw new ShopifyAdminError(429, 'shopify_throttled', 'Please wait a moment before trying again.');
    if (!result || !result.data) throw new ShopifyAdminError(502, 'shopify_query_failed');
    return result.data;
  }
  throw new ShopifyAdminError(502, 'shopify_auth_failed');
}
