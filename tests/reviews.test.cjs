const { test } = require('node:test');
const assert = require('node:assert/strict');
const { storefront } = require('./storefront-helper.cjs');

test('reviews section combines community love, approved cards and the submission form', () => {
  const { run } = storefront();
  const markup = run('productReviews()');
  assert.ok(markup.includes('Strong routines. Big love.'));
  assert.ok(markup.includes('take their training seriously'));
  assert.ok(markup.includes('Community stories are warming up.'));
  assert.ok(markup.includes('data-form="review"'));
  assert.ok(markup.includes('published immediately'));
  assert.ok(!markup.includes('data-action="reviews-prev"'));
});

test('only approved reviews for the selected flavour are displayed', () => {
  const { run } = storefront();
  const markup = run(`approvedReviewCards([
    { approved: true, shopifyProductHandle: 'aura-whey-mawa-kulfi-1-kg', flavour: 'Mawa Kulfi', name: 'Approved customer', rating: 5, text: 'A consistent part of my routine.' },
    { approved: false, shopifyProductHandle: 'aura-whey-mawa-kulfi-1-kg', flavour: 'Mawa Kulfi', name: 'Hidden customer', rating: 5, text: 'Not approved.' },
    { approved: true, shopifyProductHandle: 'aura-whey-rich-chocolate-1-kg', flavour: 'Rich Chocolate', name: 'Other flavour', rating: 5, text: 'Not this product.' }
  ])`);
  assert.ok(markup.includes('Approved customer'));
  assert.ok(!markup.includes('Hidden customer'));
  assert.ok(!markup.includes('Other flavour'));
});

test('homepage review collection includes approved reviews from both flavours', () => {
  const { run } = storefront();
  const markup = run(`reviewShowcase('home', [
    { approved: true, flavour: 'Mawa Kulfi', name: 'Kulfi customer', rating: 5, text: 'Creamy and easy to mix.' },
    { approved: true, flavour: 'Rich Chocolate', name: 'Chocolate customer', rating: 4, text: 'Fits my morning routine.' },
    { approved: false, flavour: 'Rich Chocolate', name: 'Hidden customer', rating: 5, text: 'Awaiting approval.' }
  ])`);
  assert.ok(markup.includes('data-review-scope="home"'));
  assert.ok(markup.includes('Kulfi customer'));
  assert.ok(markup.includes('Chocolate customer'));
  assert.ok(!markup.includes('Hidden customer'));
  assert.ok(!markup.includes('review-card-track'));
});

test('homepage renders the all-flavour customer review section', () => {
  const { run } = storefront();
  const markup = run('home()');
  assert.ok(markup.includes('data-review-scope="home"'));
  assert.ok(markup.includes('Mawa Kulfi and Rich Chocolate'));
});

test('product reviews use compact horizontal cards with two-way controls', () => {
  const { run } = storefront();
  const markup = run(`reviewShowcase('product', [
    { approved: true, shopifyProductHandle: 'aura-whey-mawa-kulfi-1-kg', flavour: 'Mawa Kulfi', name: 'Product customer', rating: 5, text: 'Creamy and easy to mix.' }
  ])`);
  assert.ok(markup.includes('review-card-track'));
  assert.ok(markup.includes('data-action="reviews-prev"'));
  assert.ok(markup.includes('data-action="reviews-next"'));
});

test('review cards expose likes and deletion only to the owning browser', () => {
  const { run, storage } = storefront();
  const id = '123e4567-e89b-42d3-a456-426614174000';
  storage.set('aura_review_owners', JSON.stringify({ [id]: 'owner-token' }));
  const owned = run(`reviewCard({ id: '${id}', productName: 'Mawa Kulfi', displayName: 'Owner', rating: 5, reviewText: 'Excellent product.', likeCount: 12, liked: true })`);
  const other = run(`reviewCard({ id: '123e4567-e89b-42d3-a456-426614174001', productName: 'Mawa Kulfi', displayName: 'Other', rating: 4, reviewText: 'Tastes very good.', likeCount: 2, liked: false })`);
  assert.ok(owned.includes('data-review-like'));
  assert.ok(owned.includes('aria-pressed="true"'));
  assert.ok(owned.includes('<b>12</b>'));
  assert.ok(owned.includes('data-review-delete'));
  assert.ok(!other.includes('data-review-delete'));
});

test('review deletion uses confirmation and never places owner tokens in URLs', () => {
  const source = require('node:fs').readFileSync('app.js', 'utf8');
  assert.match(source, /Delete your review\?/);
  assert.match(source, /This permanently removes your review\./);
  assert.match(source, /method: 'DELETE'/);
  assert.match(source, /body: JSON\.stringify\(\{ ownerToken: token \}\)/);
  assert.doesNotMatch(source, /ownerToken=.*encodeURIComponent/);
});

test('review form accepts up to three product photos and cards render safe image galleries', () => {
  const { run } = storefront();
  const form = run('productReviews()');
  assert.ok(form.includes('name="reviewImages"'));
  assert.ok(form.includes('accept="image/jpeg,image/png,image/webp"'));
  assert.ok(form.includes('Optional · up to 3'));
  const card = run(`reviewCard({ id: '123e4567-e89b-42d3-a456-426614174000', productName: 'Mawa Kulfi', displayName: 'Customer', rating: 5, reviewText: 'Photo review.', imageUrls: ['https://fixture.supabase.co/photo.webp'] })`);
  assert.ok(card.includes('review-photo-grid'));
  assert.ok(card.includes('loading="lazy"'));
  assert.ok(card.includes('rel="noopener"'));
});
