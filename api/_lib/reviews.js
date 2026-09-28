import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import sharp from 'sharp';

const PRODUCTS = Object.freeze({
  'aura-whey-rich-chocolate-1-kg': { handle: 'aura-whey-rich-chocolate-1-kg', name: 'Rich Chocolate', idEnv: 'REVIEWS_RICH_CHOCOLATE_PRODUCT_ID' },
  'aura-whey-mawa-kulfi-1-kg': { handle: 'aura-whey-mawa-kulfi-1-kg', name: 'Mawa Kulfi', idEnv: 'REVIEWS_MAWA_KULFI_PRODUCT_ID' },
});
const LIMIT = 50;
const IMAGE_BUCKET = 'review-images';
const MAX_IMAGES = 3;
const MAX_IMAGE_SOURCE_BYTES = 900_000;
const MAX_REQUEST_BYTES = 3_000_000;

export class ReviewError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, message) => { throw new ReviewError(status, message); };

export function productForHandle(handle) {
  const product = PRODUCTS[String(handle || '').trim().toLowerCase()];
  if (!product) fail(422, 'Unsupported product.');
  const id = process.env[product.idEnv];
  if (!id || !/^gid:\/\/shopify\/Product\/[1-9]\d*$/.test(id)) fail(503, 'Reviews are temporarily unavailable.');
  return { id, handle: product.handle, name: product.name };
}

function clean(value) {
  return String(value ?? '').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function validateSubmission(body) {
  if (!body || typeof body !== 'object') fail(422, 'Enter a rating and review.');
  const product = productForHandle(body.productHandle);
  const displayName = clean(body.displayName);
  const reviewText = clean(body.reviewText);
  const rating = body.rating;
  if (displayName.length < 2 || displayName.length > 60 || !Number.isInteger(rating) || rating < 1 || rating > 5 || reviewText.length < 10 || reviewText.length > 1000 || /[<>]/.test(displayName + reviewText)) fail(422, 'Enter your name, a rating from 1 to 5, and a review of at least 10 characters.');
  if (body.website) fail(422, 'Unable to submit this review.');
  const images = body.images == null ? [] : body.images;
  if (!Array.isArray(images) || images.length > MAX_IMAGES || images.some(image => typeof image !== 'string' || image.length > 1_250_000 || !/^data:image\/(?:jpeg|png|webp);base64,/.test(image))) fail(422, 'Add no more than 3 valid JPEG, PNG, or WebP product photos.');
  return { product, displayName, rating, reviewText, images };
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.startsWith('https://') || !key) fail(503, 'Reviews are temporarily unavailable.');
  return { url, key };
}

function fingerprint(value) {
  const secret = process.env.REVIEWS_IP_HASH_SECRET;
  if (!secret || secret.length < 32) fail(503, 'Reviews are temporarily unavailable.');
  return createHmac('sha256', secret).update(value).digest('hex');
}

function keyedHash(value, name) {
  const secret = process.env[name];
  if (!secret || secret.length < 32) fail(503, 'Reviews are temporarily unavailable.');
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function ownerTokenHash(token) { return keyedHash(token, 'REVIEWS_OWNER_TOKEN_SECRET'); }
export function visitorHash(visitorId) { return keyedHash(visitorId, 'REVIEWS_VISITOR_HASH_SECRET'); }
export function ipHash(ip) { return fingerprint(ip); }

async function antiSpam(ip, input) {
  const ipHash = fingerprint(ip);
  const duplicateHash = fingerprint(`${ipHash}\n${input.product.id}\n${input.displayName.toLowerCase()}\n${input.reviewText.toLowerCase()}`);
  const result = await reviewDb('rpc/check_review_antispam', { method: 'POST', body: JSON.stringify({ p_ip_hash: ipHash, p_duplicate_hash: duplicateHash }) }, 'check_antispam');
  const decision = Array.isArray(result) ? result[0] : result;
  if (!decision || decision.allowed !== true) fail(decision?.reason === 'rate_limited' ? 429 : decision?.reason === 'duplicate' ? 409 : 503, decision?.reason === 'rate_limited' ? 'Please wait before submitting another review.' : decision?.reason === 'duplicate' ? 'This review was already submitted recently.' : 'Reviews are temporarily unavailable.');
}

function safeDiagnostic(value) {
  if (value == null) return null;
  let result = String(value);
  for (const name of ['SUPABASE_SERVICE_ROLE_KEY', 'REVIEWS_IP_HASH_SECRET', 'REVIEWS_OWNER_TOKEN_SECRET', 'REVIEWS_VISITOR_HASH_SECRET', 'SHOPIFY_ADMIN_CLIENT_SECRET', 'SHOPIFY_ADMIN_ACCESS_TOKEN']) {
    const secret = process.env[name];
    if (secret) result = result.split(secret).join('[redacted]');
  }
  result = result.replace(/\b[0-9a-f]{64}\b/gi, '[redacted-hash]');
  return result.slice(0, 500);
}

export async function reviewDb(path, options = {}, operation = 'reviews_request') {
  const { url, key } = supabaseConfig();
  const authorization = /^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key) ? { Authorization: `Bearer ${key}` } : {};
  let response;
  try {
    response = await fetch(`${url}/rest/v1/${path}`, { ...options, headers: { apikey: key, ...authorization, 'Content-Type': 'application/json', ...(options.headers || {}) }, signal: AbortSignal.timeout(10000) });
  } catch (error) {
    console.error('[reviews:supabase-network]', { operation, error: safeDiagnostic(error instanceof Error ? error.message : 'Unknown fetch error') });
    fail(502, 'Reviews are temporarily unavailable.');
  }
  if (!response.ok) {
    let parsedError = null;
    try { parsedError = await response.json(); } catch { /* Supabase can return an empty or non-JSON error body. */ }
    console.error('[reviews:supabase]', {
      operation,
      status: response.status,
      statusText: safeDiagnostic(response.statusText),
      code: safeDiagnostic(parsedError?.code),
      message: safeDiagnostic(parsedError?.message),
      details: safeDiagnostic(parsedError?.details),
      hint: safeDiagnostic(parsedError?.hint),
    });
    fail(502, 'Reviews are temporarily unavailable.');
  }
  if (response.status === 204) return null;
  if (typeof response.text !== 'function') return response.json();
  const raw = await response.text();
  if (!raw.trim()) return null;
  try { return JSON.parse(raw); }
  catch { fail(502, 'Reviews are temporarily unavailable.'); }
}

function storageHeaders(contentType = 'application/json') {
  const { key } = supabaseConfig();
  const authorization = /^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key) ? { Authorization: `Bearer ${key}` } : {};
  return { apikey: key, ...authorization, 'Content-Type': contentType };
}

async function storageRequest(path, options, operation) {
  const { url } = supabaseConfig();
  let response;
  try { response = await fetch(`${url}/storage/v1/${path}`, { ...options, headers: { ...storageHeaders(options.contentType), ...(options.headers || {}) }, signal: AbortSignal.timeout(15000) }); }
  catch (error) { console.error('[reviews:storage-network]', { operation, error: safeDiagnostic(error instanceof Error ? error.message : 'Unknown storage error') }); fail(502, 'Unable to save review photos right now.'); }
  if (!response.ok) { console.error('[reviews:storage]', { operation, status: response.status, statusText: safeDiagnostic(response.statusText) }); fail(502, 'Unable to save review photos right now.'); }
  return response;
}

function publicImageUrl(path) {
  const { url } = supabaseConfig();
  return `${url}/storage/v1/object/public/${IMAGE_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

async function removeReviewImages(paths, failOnError = false) {
  if (!paths?.length) return;
  try { await storageRequest(`object/${IMAGE_BUCKET}`, { method: 'DELETE', body: JSON.stringify({ prefixes: paths }), contentType: 'application/json' }, 'delete_review_images'); }
  catch (error) { if (failOnError) throw error; console.error('[reviews:storage-cleanup]', { operation: 'delete_review_images', error: 'Cleanup deferred.' }); }
}

async function prepareReviewImage(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) fail(422, 'Use JPEG, PNG, or WebP product photos.');
  const source = Buffer.from(match[2], 'base64');
  if (!source.length || source.length > MAX_IMAGE_SOURCE_BYTES) fail(422, 'Each product photo must be under 900 KB after preparation.');
  try {
    let output = await sharp(source, { limitInputPixels: 25_000_000, failOn: 'warning' }).rotate().resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toBuffer();
    if (output.length > 800_000) output = await sharp(source, { limitInputPixels: 25_000_000, failOn: 'warning' }).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 70, effort: 4 }).toBuffer();
    if (output.length > 800_000) fail(422, 'This product photo could not be compressed enough.');
    return output;
  } catch (error) { if (error instanceof ReviewError) throw error; fail(422, 'One of the product photos is invalid.'); }
}

async function uploadReviewImages(reviewId, images) {
  const paths = [];
  try {
    for (const dataUrl of images) {
      const image = await prepareReviewImage(dataUrl);
      const path = `${reviewId}/${randomUUID()}.webp`;
      await storageRequest(`object/${IMAGE_BUCKET}/${path}`, { method: 'POST', body: image, contentType: 'image/webp', headers: { 'x-upsert': 'false', 'Cache-Control': '31536000' } }, 'upload_review_image');
      paths.push(path);
    }
    return paths;
  } catch (error) { await removeReviewImages(paths); throw error; }
}

export async function createReview(request) {
  const rawBody = typeof request.body === 'string' ? request.body : JSON.stringify(request.body || {});
  if (Buffer.byteLength(rawBody) > MAX_REQUEST_BYTES) fail(413, 'Review photos are too large.');
  let body;
  try { body = typeof request.body === 'string' ? JSON.parse(request.body) : request.body; }
  catch { fail(400, 'Invalid review request.'); }
  const input = validateSubmission(body);
  const ownerToken = randomBytes(32).toString('base64url');
  const ownerTokenDigest = ownerTokenHash(ownerToken);
  const ip = String(request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  await antiSpam(ip, input);
  const reviewId = randomUUID();
  const imagePaths = await uploadReviewImages(reviewId, input.images);
  const review = { id: reviewId, shopify_product_id: input.product.id, shopify_product_handle: input.product.handle, product_name: input.product.name, display_name: input.displayName, rating: input.rating, review_text: input.reviewText, created_at: new Date().toISOString(), owner_token_hash: ownerTokenDigest, image_paths: imagePaths };
  try { await reviewDb('reviews', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(review) }, 'create_review'); }
  catch (error) { await removeReviewImages(imagePaths); throw error; }
  return { ...publicReview(review), ownerToken };
}

export function publicReview(review) { return { id: review.id, shopifyProductHandle: review.shopify_product_handle, productName: review.product_name, displayName: review.display_name, rating: review.rating, reviewText: review.review_text, createdAt: review.created_at, imageUrls: Array.isArray(review.image_paths) ? review.image_paths.map(publicImageUrl) : [], likeCount: Number(review.like_count || 0), liked: review.liked === true }; }

export async function listReviews(request) {
  const params = new URL(request.url || '/', 'http://localhost').searchParams;
  const scope = params.get('scope') === 'home' ? 'home' : 'product';
  const handle = scope === 'home' ? null : productForHandle(params.get('product')).handle;
  const visitorId = String(request.headers?.['x-aura-review-visitor'] || '').trim();
  const hashedVisitor = /^[A-Za-z0-9_-]{43}$/.test(visitorId) ? visitorHash(visitorId) : null;
  const rows = await reviewDb('rpc/list_public_reviews_with_images', { method: 'POST', body: JSON.stringify({ p_product_handle: handle, p_scope: scope, p_visitor_hash: hashedVisitor, p_limit: LIMIT }) }, 'list_reviews');
  return rows.map(publicReview);
}

export { removeReviewImages };
