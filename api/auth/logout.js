import { authConfig, clearSessionCookies, discoverAuth, noStore, readSession } from '../_lib/customer-auth.js';

export default async function handler(request, response) {
  noStore(response);
  if (request.method !== 'GET') return response.status(405).json({ message: 'Method not allowed.' });
  try {
    const config = authConfig();
    const session = readSession(request, config.sessionSecret);
    clearSessionCookies(response);
    if (!session?.idToken) return response.redirect(302, config.logoutUrl);
    const discovery = await discoverAuth(config.shopDomain);
    const url = new URL(discovery.end_session_endpoint);
    url.searchParams.set('id_token_hint', session.idToken);
    url.searchParams.set('post_logout_redirect_uri', config.logoutUrl);
    return response.redirect(302, url.toString());
  } catch (error) {
    console.error('Customer logout error:', error.message);
    clearSessionCookies(response);
    return response.redirect(302, 'https://www.aurawhey.in');
  }
}
