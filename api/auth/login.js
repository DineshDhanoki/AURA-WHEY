import { authConfig, discoverAuth, noStore, randomUrlSafe, setOauthCookie } from '../_lib/customer-auth.js';

export default async function handler(request, response) {
  noStore(response);
  if (request.method !== 'GET') return response.status(405).json({ message: 'Method not allowed.' });
  try {
    const config = authConfig();
    const discovery = await discoverAuth(config.shopDomain);
    const state = randomUrlSafe();
    const nonce = randomUrlSafe();
    setOauthCookie(response, { state, nonce, createdAt: Date.now() }, config.sessionSecret);
    const url = new URL(discovery.authorization_endpoint);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', config.callbackUrl);
    url.searchParams.set('scope', 'openid email customer-account-api:full');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    url.searchParams.set('region_country', 'IN');
    return response.redirect(302, url.toString());
  } catch (error) {
    console.error('Customer login error:', error.message);
    return response.redirect(302, '/account?auth=unavailable');
  }
}
