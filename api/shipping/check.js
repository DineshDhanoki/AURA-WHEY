const SHIPROCKET_API = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = '';
let cachedTokenExpiresAt = 0;

function send(res, body, status = 200) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

async function shiprocketToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) return cachedToken;
  const email = process.env.SHIPROCKET_API_EMAIL;
  const password = process.env.SHIPROCKET_API_PASSWORD;
  if (!email || !password) throw new Error('Shipping service is not configured.');

  const response = await fetch(`${SHIPROCKET_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.token) throw new Error('Shipping service authentication failed.');

  cachedToken = payload.token;
  // Shiprocket tokens last 10 days; refresh a little early.
  cachedTokenExpiresAt = Date.now() + (9 * 24 * 60 * 60 * 1000);
  return cachedToken;
}

function bestCourier(payload) {
  const couriers = payload?.data?.available_courier_companies;
  if (!Array.isArray(couriers)) return null;
  const available = couriers.filter(courier => !courier.blocked && courier.pickup_availability !== '0');
  if (!available.length) return null;
  return available.sort((a, b) => {
    const aDays = Number(a.estimated_delivery_days) || Number.POSITIVE_INFINITY;
    const bDays = Number(b.estimated_delivery_days) || Number.POSITIVE_INFINITY;
    return aDays - bDays;
  })[0];
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return send(response, { message: 'Method not allowed.' }, 405);

  let input;
  try { input = typeof request.body === 'string' ? JSON.parse(request.body) : (request.body || {}); } catch {
    return send(response, { available: false, message: 'Invalid request.' }, 400);
  }

  const deliveryPostcode = String(input.pincode || '').trim();
  if (!/^\d{6}$/.test(deliveryPostcode)) return send(response, { available: false, message: 'Enter a valid 6-digit pincode.' }, 400);

  const pickupPostcode = String(process.env.SHIPROCKET_PICKUP_POSTCODE || '410221');
  const quantity = Math.max(1, Math.min(20, Number(input.quantity) || 1));
  const packageWeight = Number(process.env.SHIPROCKET_WEIGHT_KG || '2.4');
  const weight = Math.max(0.1, packageWeight * quantity);
  const params = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: deliveryPostcode,
    cod: '1',
    weight: String(weight),
    length: String(process.env.SHIPROCKET_LENGTH_CM || '30'),
    breadth: String(process.env.SHIPROCKET_BREADTH_CM || '20'),
    height: String(process.env.SHIPROCKET_HEIGHT_CM || '20'),
  });

  try {
    const token = await shiprocketToken();
    const upstream = await fetch(`${SHIPROCKET_API}/courier/serviceability/?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) throw new Error('Unable to check delivery availability right now.');
    const courier = bestCourier(payload);
    if (!courier) return send(response, { available: false, codAvailable: false, message: 'Delivery is not available for this pincode.' });

    const eta = courier.estimated_delivery_days ? `${courier.estimated_delivery_days} day${Number(courier.estimated_delivery_days) === 1 ? '' : 's'}` : '';
    return send(response, {
      available: true,
      codAvailable: Boolean(courier.cod),
      eta,
      message: `Delivery available${eta ? `. Estimated delivery in ${eta}` : ''}.`,
    });
  } catch (error) {
    console.error('Shiprocket serviceability error:', error);
    return send(response, { available: false, message: error.message || 'Unable to check delivery availability right now.' }, 502);
  }
}
