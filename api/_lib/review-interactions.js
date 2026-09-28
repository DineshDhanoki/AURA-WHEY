import { timingSafeEqual } from 'node:crypto';
import { ReviewError, ipHash, ownerTokenHash, removeReviewImages, reviewDb, visitorHash } from './reviews.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const fail = (status, message) => { throw new ReviewError(status, message); };

function body(request, maxBytes = 1024) {
  const raw = typeof request.body === 'string' ? request.body : JSON.stringify(request.body || {});
  if (Buffer.byteLength(raw) > maxBytes) fail(413, 'Request is too large.');
  try { return typeof request.body === 'string' ? JSON.parse(request.body) : request.body || {}; }
  catch { fail(400, 'Invalid request.'); }
}

function requestIp(request) {
  return String(request.headers?.['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

export function validateReviewId(value) {
  const id = String(value || '').trim();
  if (!UUID.test(id)) fail(422, 'Invalid review.');
  return id;
}

export function requireSameOrigin(request) {
  const origin = String(request.headers?.origin || '').trim();
  if (!origin) return;
  let hostname;
  try { hostname = new URL(origin).hostname; } catch { fail(403, 'Request not allowed.'); }
  if (hostname !== 'www.aurawhey.in' && hostname !== 'aurawhey.in' && hostname !== 'localhost' && hostname !== '127.0.0.1') fail(403, 'Request not allowed.');
}

function decision(result) { return Array.isArray(result) ? result[0] : result; }

export async function setReviewLike(request, reviewId, liked) {
  requireSameOrigin(request);
  const id = validateReviewId(reviewId);
  const input = body(request);
  const visitorId = String(input.visitorId || '').trim();
  if (!TOKEN.test(visitorId)) fail(422, 'Invalid visitor.');
  const result = decision(await reviewDb('rpc/set_review_like', {
    method: 'POST',
    body: JSON.stringify({ p_review_id: id, p_visitor_hash: visitorHash(visitorId), p_ip_hash: ipHash(requestIp(request)), p_liked: liked }),
  }, liked ? 'like_review' : 'unlike_review'));
  if (!result || result.ok !== true) {
    if (result?.reason === 'rate_limited') fail(429, 'Please wait before trying again.');
    if (result?.reason === 'not_found') fail(404, 'Review not found.');
    fail(502, 'Reviews are temporarily unavailable.');
  }
  return { reviewId: id, likeCount: Number(result.like_count || 0), liked: result.liked === true };
}

export async function deleteOwnedReview(request, reviewId) {
  requireSameOrigin(request);
  const id = validateReviewId(reviewId);
  const input = body(request);
  const ownerToken = String(input.ownerToken || '').trim();
  if (!TOKEN.test(ownerToken)) fail(403, 'Unable to delete this review.');
  const rate = decision(await reviewDb('rpc/check_review_delete_rate_limit', { method: 'POST', body: JSON.stringify({ p_ip_hash: ipHash(requestIp(request)) }) }, 'delete_review_rate_limit'));
  if (!rate?.allowed) fail(rate?.reason === 'rate_limited' ? 429 : 502, rate?.reason === 'rate_limited' ? 'Please wait before trying again.' : 'Reviews are temporarily unavailable.');
  const rows = await reviewDb(`reviews?select=id,owner_token_hash,image_paths&id=eq.${encodeURIComponent(id)}&limit=1`, {}, 'get_review_owner');
  const stored = rows?.[0]?.owner_token_hash;
  const supplied = ownerTokenHash(ownerToken);
  if (!stored || !/^[0-9a-f]{64}$/.test(stored)) fail(403, 'Unable to delete this review.');
  const storedBytes = Buffer.from(stored, 'hex');
  const suppliedBytes = Buffer.from(supplied, 'hex');
  if (storedBytes.length !== suppliedBytes.length || !timingSafeEqual(storedBytes, suppliedBytes)) fail(403, 'Unable to delete this review.');
  await reviewDb(`reviews?id=eq.${encodeURIComponent(id)}&owner_token_hash=eq.${encodeURIComponent(stored)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }, 'delete_review');
  await removeReviewImages(Array.isArray(rows[0].image_paths) ? rows[0].image_paths : []);
  return { deleted: true, reviewId: id };
}
