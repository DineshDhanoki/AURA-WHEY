import { activeSession, customerQuery, noStore } from '../_lib/customer-auth.js';

const ORDERS_QUERY = `query CustomerOrders($first: Int!) {
  customer {
    orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
      nodes { id name processedAt financialStatus fulfillmentStatus totalPrice { amount currencyCode } }
    }
  }
}`;

export default async function handler(request, response) {
  noStore(response);
  if (request.method !== 'GET') return response.status(405).json({ message: 'Method not allowed.' });
  try {
    const { config, session } = await activeSession(request, response);
    if (!session) return response.status(401).json({ message: 'Authentication required.' });
    const data = await customerQuery(config, session.accessToken, ORDERS_QUERY, { first: 20 });
    return response.status(200).json({ orders: data.customer?.orders?.nodes || [] });
  } catch (error) {
    console.error('Customer orders error:', error.message);
    return response.status(502).json({ message: 'Unable to load orders right now.' });
  }
}
