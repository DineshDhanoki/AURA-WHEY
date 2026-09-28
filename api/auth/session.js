import { activeSession, clearSessionCookies, customerQuery, noStore } from '../_lib/customer-auth.js';

const CUSTOMER_QUERY = `query CustomerAccount {
  customer { id displayName firstName lastName emailAddress { emailAddress } }
}`;

export default async function handler(request, response) {
  noStore(response);
  if (request.method !== 'GET') return response.status(405).json({ message: 'Method not allowed.' });
  try {
    const { config, session } = await activeSession(request, response);
    if (!session) return response.status(200).json({ authenticated: false });
    const data = await customerQuery(config, session.accessToken, CUSTOMER_QUERY);
    const customer = data.customer;
    return response.status(200).json({
      authenticated: true,
      customer: {
        displayName: customer.displayName || [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Aura Whey customer',
        email: customer.emailAddress?.emailAddress || '',
      },
    });
  } catch (error) {
    console.error('Customer session error:', error.message);
    clearSessionCookies(response);
    return response.status(200).json({ authenticated: false });
  }
}
