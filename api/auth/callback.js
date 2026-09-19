import { authConfig, clearOauthCookieHeader, discoverAuth, exchangeAuthorizationCode, noStore, readOauthCookie, sessionFromToken, setSessionCookies, verifyIdToken } from '../_lib/customer-auth.js';

export default async function handler(request, response) {
  noStore(response);
  if (request.method !== 'GET') return response.status(405).json({ message: 'Method not allowed.' });
  try {
    const config = authConfig();
    const transaction = readOauthCookie(request, config.sessionSecret);
    const { code, state, error } = request.query || {};
    if (error || !code || !state || !transaction || transaction.state !== state || Date.now() - transaction.createdAt > 600_000) {
      throw new Error('The customer authentication response was invalid or expired.');
    }
    const discovery = await discoverAuth(config.shopDomain);
    const token = await exchangeAuthorizationCode(config, discovery.token_endpoint, code);
    await verifyIdToken(token.id_token, discovery, config, transaction.nonce);
    setSessionCookies(response, sessionFromToken(token), config.sessionSecret);
    const cookies = response.getHeader('Set-Cookie');
    response.setHeader('Set-Cookie', [...(Array.isArray(cookies) ? cookies : [cookies]), clearOauthCookieHeader()]);
    return response.redirect(302, 'https://www.aurawhey.in');
  } catch (error) {
    console.error('Customer callback error:', error.message);
    response.setHeader('Set-Cookie', clearOauthCookieHeader());
    return response.redirect(302, '/account?auth=failed');
  }
}
