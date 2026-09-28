const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

process.env.SUPABASE_URL = 'https://fixture.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_fixture-service-role-key';
process.env.REVIEWS_IP_HASH_SECRET = 'fixture-review-ip-secret-012345678901234567890';
process.env.REVIEWS_OWNER_TOKEN_SECRET = 'fixture-owner-token-secret-012345678901234567890';
process.env.REVIEWS_VISITOR_HASH_SECRET = 'fixture-visitor-hash-secret-01234567890123456789';

const interactions = import('../api/_lib/review-interactions.js');
const reviews = import('../api/_lib/reviews.js');
const reviewId = '123e4567-e89b-42d3-a456-426614174000';
const otherId = '123e4567-e89b-42d3-a456-426614174001';
const visitorA = 'A'.repeat(43);
const visitorB = 'B'.repeat(43);

function request(body, ip = '203.0.113.15') {
  return { body, headers: { origin: 'https://www.aurawhey.in', 'x-forwarded-for': ip } };
}

function ok(payload, status = 200) {
  return { ok: true, status, statusText: 'OK', json: async () => payload };
}

test('like and unlike return authoritative state from one atomic RPC', async t => {
  const { setReviewLike } = await interactions;
  const calls = [];
  const states = [
    [{ ok: true, reason: 'ok', like_count: 1, liked: true }],
    [{ ok: true, reason: 'ok', like_count: 1, liked: true }],
    [{ ok: true, reason: 'ok', like_count: 2, liked: true }],
    [{ ok: true, reason: 'ok', like_count: 1, liked: false }],
    [{ ok: true, reason: 'ok', like_count: 1, liked: false }],
  ];
  t.mock.method(global, 'fetch', async (url, options) => { calls.push({ url, body: JSON.parse(options.body) }); return ok(states.shift()); });
  assert.deepEqual(await setReviewLike(request({ visitorId: visitorA }), reviewId, true), { reviewId, likeCount: 1, liked: true });
  assert.equal((await setReviewLike(request({ visitorId: visitorA }), reviewId, true)).likeCount, 1);
  assert.equal((await setReviewLike(request({ visitorId: visitorB }), reviewId, true)).likeCount, 2);
  assert.deepEqual(await setReviewLike(request({ visitorId: visitorA }), reviewId, false), { reviewId, likeCount: 1, liked: false });
  assert.equal((await setReviewLike(request({ visitorId: visitorA }), reviewId, false)).likeCount, 1);
  assert.equal(calls.length, 5);
  assert.ok(calls.every(call => call.url.endsWith('/rest/v1/rpc/set_review_like')));
  assert.ok(calls.every(call => !JSON.stringify(call.body).includes('203.0.113.15')));
  assert.notEqual(calls[0].body.p_visitor_hash, visitorA);
});

test('like validation, missing reviews, rate limits and same-origin checks fail safely', async t => {
  const { setReviewLike } = await interactions;
  let calls = 0;
  t.mock.method(global, 'fetch', async () => { calls += 1; return ok([{ ok: false, reason: calls === 1 ? 'not_found' : 'rate_limited', like_count: 0, liked: false }]); });
  await assert.rejects(setReviewLike(request({ visitorId: visitorA }), otherId, true), { status: 404 });
  await assert.rejects(setReviewLike(request({ visitorId: visitorA }), reviewId, true), { status: 429 });
  await assert.rejects(setReviewLike(request({ visitorId: 'short' }), reviewId, true), { status: 422 });
  await assert.rejects(setReviewLike(request({ visitorId: visitorA }), 'not-a-uuid', true), { status: 422 });
  await assert.rejects(setReviewLike({ body: { visitorId: visitorA }, headers: { origin: 'https://evil.example' } }, reviewId, true), { status: 403 });
  assert.equal(calls, 2);
});

test('only the correct anonymous owner token can delete a review', async t => {
  const { deleteOwnedReview } = await interactions;
  const { ownerTokenHash } = await reviews;
  const token = 'C'.repeat(43);
  const storedHash = ownerTokenHash(token);
  const calls = [];
  t.mock.method(global, 'fetch', async (url, options) => {
    calls.push({ url, method: options.method || 'GET', body: options.body });
    if (url.includes('/rpc/check_review_delete_rate_limit')) return ok([{ allowed: true, reason: 'allowed' }]);
    if (url.includes('/storage/v1/object/review-images')) return ok([]);
    if ((options.method || 'GET') === 'DELETE') return ok(null, 204);
    return ok([{ id: reviewId, owner_token_hash: storedHash, image_paths: [`${reviewId}/photo.webp`] }]);
  });
  assert.deepEqual(await deleteOwnedReview(request({ ownerToken: token }), reviewId), { deleted: true, reviewId });
  assert.equal(calls.filter(call => call.method === 'DELETE').length, 2);
  assert.equal(calls.filter(call => call.url.includes('/storage/v1/object/review-images')).length, 1);
  assert.ok(calls.every(call => !String(call.body || '').includes(token)));
});

test('wrong, missing, cross-review and legacy ownership cannot delete', async t => {
  const { deleteOwnedReview } = await interactions;
  const { ownerTokenHash } = await reviews;
  const owner = 'D'.repeat(43);
  let stored = ownerTokenHash(owner);
  let deletes = 0;
  t.mock.method(global, 'fetch', async (url, options) => {
    if (url.includes('/rpc/')) return ok([{ allowed: true, reason: 'allowed' }]);
    if ((options.method || 'GET') === 'DELETE') { deletes += 1; return ok(null, 204); }
    return ok([{ id: reviewId, owner_token_hash: stored }]);
  });
  await assert.rejects(deleteOwnedReview(request({ ownerToken: 'E'.repeat(43) }), reviewId), { status: 403 });
  await assert.rejects(deleteOwnedReview(request({}), reviewId), { status: 403 });
  await assert.rejects(deleteOwnedReview(request({ ownerToken: 'F'.repeat(43) }), otherId), { status: 403 });
  stored = null;
  await assert.rejects(deleteOwnedReview(request({ ownerToken: owner }), reviewId), { status: 403 });
  await assert.rejects(deleteOwnedReview(request({ ownerToken: owner }), 'bad-id'), { status: 422 });
  assert.equal(deletes, 0);
});

test('delete rate-limit failure fails closed before ownership lookup', async t => {
  const { deleteOwnedReview } = await interactions;
  let calls = 0;
  t.mock.method(global, 'fetch', async () => { calls += 1; return ok([{ allowed: false, reason: 'rate_limited' }]); });
  await assert.rejects(deleteOwnedReview(request({ ownerToken: 'G'.repeat(43) }), reviewId), { status: 429 });
  assert.equal(calls, 1);
});

test('migration enforces uniqueness, cascading deletes, distributed limits and private access', () => {
  const sql = fs.readFileSync('docs/REVIEWS-INTERACTIONS-SUPABASE.sql', 'utf8');
  assert.match(sql, /unique\s*\(review_id, visitor_hash\)/i);
  assert.match(sql, /references public\.reviews\(id\) on delete cascade/i);
  assert.match(sql, /pg_advisory_xact_lock[\s\S]*p_ip_hash[\s\S]*pg_advisory_xact_lock[\s\S]*p_visitor_hash/i);
  assert.match(sql, /visitor_actions >= 20 or ip_actions >= 60/i);
  assert.match(sql, /revoke all[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute[\s\S]*to service_role/i);
  const imageSql = fs.readFileSync('docs/REVIEWS-IMAGES-SUPABASE.sql', 'utf8');
  assert.match(imageSql, /add column if not exists image_paths text\[\]/i);
  assert.match(imageSql, /cardinality\(image_paths\) <= 3/i);
  assert.match(imageSql, /'review-images'.*true.*800000/is);
  assert.match(imageSql, /list_public_reviews_with_images/i);
  assert.match(imageSql, /revoke all[\s\S]*from public, anon, authenticated/i);
});

test('public review serialization never exposes ownership, visitor, IP or Supabase data', async () => {
  const { publicReview } = await reviews;
  const result = publicReview({ id: reviewId, shopify_product_handle: 'aura-whey-mawa-kulfi-1-kg', product_name: 'Mawa Kulfi', display_name: 'K', rating: 5, review_text: 'Excellent product.', created_at: 'now', like_count: 2, liked: false, owner_token_hash: 'secret', visitor_hash: 'visitor', ip_hash: 'ip', apikey: 'key' });
  assert.deepEqual(Object.keys(result), ['id', 'shopifyProductHandle', 'productName', 'displayName', 'rating', 'reviewText', 'createdAt', 'imageUrls', 'likeCount', 'liked']);
  assert.equal(JSON.stringify(result).includes('secret'), false);
  assert.equal(JSON.stringify(result).includes('visitor'), false);
});
