import { createHash } from 'node:crypto';
import { adminQuery, ShopifyAdminError } from './_lib/shopify-admin.js';
import { TRACK_ORDER_BY_ID_QUERY, cancellationEligibility, orderBelongsToInput, publicOrder, resolveTrackOrder } from './track-order.js';

const NOT_FOUND = 'Order not found. Check your order number and email and try again.';
const UNAVAILABLE = 'This order cannot be cancelled online. Please contact AURA WHEY support.';
const REASONS = new Map([
  ['changed_mind', 'Changed my mind'],
  ['ordered_by_mistake', 'Ordered by mistake'],
  ['incorrect_product', 'Incorrect product'],
  ['other', 'Other'],
]);
const attempts = new Map();
const inFlight = new Map();
const acceptedCancellations = new Set();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;

export function clearAcceptedCancellationState() { acceptedCancellations.clear(); }

export const CANCEL_MUTATION = `mutation TrackOrderCancel($orderId: ID!, $refundMethod: OrderCancelRefundMethodInput!, $staffNote: String!) {
  orderCancel(orderId: $orderId, reason: CUSTOMER, notifyCustomer: true, restock: true, refundMethod: $refundMethod, staffNote: $staffNote) {
    job { id done }
    orderCancelUserErrors { field message code }
    userErrors { field message }
  }
}`;

class TrackCancellationError extends Error {
  constructor(status, code, message = UNAVAILABLE) { super(message); this.status = status; this.code = code; }
}

function fail(status, code, message) { throw new TrackCancellationError(status, code, message); }
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function clientFingerprint(request) {
  const ip = String(request.headers?.['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown').split(',')[0].trim().slice(0, 128);
  return createHash('sha256').update(ip).digest('hex');
}
function allowRequest(request) {
  const key = clientFingerprint(request);
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter(time => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 1000) for (const [fingerprint, times] of attempts) if (!times.some(time => now - time < RATE_WINDOW_MS)) attempts.delete(fingerprint);
  return true;
}

export function validateCancellationBody(body) {
  if (!body || typeof body !== 'object' || !REASONS.has(body.reason)) fail(400, 'invalid_request', 'Choose a cancellation reason and try again.');
  return { orderNumber: body.orderNumber, email: body.email, reason: body.reason };
}

function refundStatus(order) {
  if (order.displayFinancialStatus === 'REFUNDED') return 'Refunded';
  if (order.displayFinancialStatus === 'PARTIALLY_REFUNDED') return 'Partially refunded';
  if (order.displayFinancialStatus === 'AUTHORIZED') return 'Payment authorization release pending';
  if (order.cancelledAt && order.displayFinancialStatus === 'PAID') return 'Refund pending or not yet confirmed';
  return order.displayFinancialStatus || 'Unavailable';
}

export const dependencies = {
  resolve: resolveTrackOrder,
  now: () => Date.now(),
  wait: delay,
  async latest(config, id) { return (await adminQuery(config, TRACK_ORDER_BY_ID_QUERY, { id })).order; },
  async cancel(config, id, staffNote) {
    return (await adminQuery(config, CANCEL_MUTATION, {
      orderId: id,
      refundMethod: { originalPaymentMethodsRefund: true },
      staffNote,
    })).orderCancel;
  },
};

async function confirmedResult(order, alreadyCancelled = false) {
  acceptedCancellations.delete(order.id);
  return { status: 200, payload: { cancelled: true, alreadyCancelled, paymentStatus: order.displayFinancialStatus || null, refundStatus: refundStatus(order), order: publicOrder(order) } };
}

function processingResult() {
  return { status: 202, payload: { status: 'processing', cancelled: false } };
}

export async function cancelTrackedOrder(body, deps = dependencies) {
  const request = validateCancellationBody(body);
  const { input, order: found, config } = await deps.resolve(request);
  if (found.cancelledAt) return confirmedResult(found, true);

  if (acceptedCancellations.has(found.id)) {
    const latest = await deps.latest(config, found.id);
    if (latest && orderBelongsToInput(latest, input) && latest.cancelledAt) return confirmedResult(latest, true);
    return processingResult();
  }

  const existing = inFlight.get(found.id);
  if (existing) {
    await existing.catch(() => {});
    const latest = await deps.latest(config, found.id);
    if (latest && orderBelongsToInput(latest, input) && latest.cancelledAt) return confirmedResult(latest, true);
    fail(409, 'in_progress', 'A cancellation request is already being processed. Check the order again shortly.');
  }

  const operation = (async () => {
    let latest = await deps.latest(config, found.id);
    if (!latest || !orderBelongsToInput(latest, input)) fail(404, 'not_found', NOT_FOUND);
    if (latest.cancelledAt) return confirmedResult(latest, true);
    const check = cancellationEligibility(latest, deps.now());
    if (!check.eligible) fail(409, check.code, check.message);

    const staffNote = `Customer cancellation from AURA WHEY Track Order: ${REASONS.get(request.reason)}.`;
    const mutation = await deps.cancel(config, latest.id, staffNote);
    const errors = [...(mutation?.orderCancelUserErrors || []), ...(mutation?.userErrors || [])];
    if (errors.length || !mutation?.job) {
      latest = await deps.latest(config, found.id);
      if (latest && orderBelongsToInput(latest, input) && latest.cancelledAt) return confirmedResult(latest, true);
      fail(409, 'shopify_rejected');
    }
    acceptedCancellations.add(found.id);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      latest = await deps.latest(config, found.id);
      if (!latest || !orderBelongsToInput(latest, input)) fail(404, 'not_found', NOT_FOUND);
      if (latest.cancelledAt) return confirmedResult(latest);
      if (attempt < 4) await deps.wait(350);
    }
    return processingResult();
  })();

  inFlight.set(found.id, operation);
  try { return await operation; }
  finally { if (inFlight.get(found.id) === operation) inFlight.delete(found.id); }
}

function sameOrigin(request) {
  if (request.headers?.['sec-fetch-site'] === 'cross-site') return false;
  const origin = request.headers?.origin;
  const host = String(request.headers?.['x-forwarded-host'] || request.headers?.host || '').split(',')[0].trim();
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return response.status(405).json({ message: 'Method not allowed.' }); }
  if (!String(request.headers?.['content-type'] || '').toLowerCase().startsWith('application/json') || !sameOrigin(request)) return response.status(403).json({ message: UNAVAILABLE });
  if (!allowRequest(request)) { response.setHeader('Retry-After', '900'); return response.status(429).json({ message: 'Please wait before trying again.' }); }
  try {
    let body = request.body;
    try { if (typeof body === 'string') body = JSON.parse(body); } catch { return response.status(400).json({ message: 'Choose a cancellation reason and try again.' }); }
    const result = await cancelTrackedOrder(body);
    return response.status(result.status).json(result.payload);
  } catch (error) {
    if (error instanceof ShopifyAdminError) return response.status(error.status === 429 ? 429 : 502).json({ message: error.status === 429 ? 'Please wait before trying again.' : UNAVAILABLE });
    if (error instanceof TrackCancellationError) return response.status(error.status).json({ message: error.message });
    return response.status(502).json({ message: UNAVAILABLE });
  }
}
