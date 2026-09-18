const { test } = require('node:test');
const assert = require('node:assert/strict');
const { storefront } = require('./storefront-helper.cjs');

test('product reviews render the verified review panel and image-enabled submission form', () => {
  const { run } = storefront();
  const markup = run('productReviews()');
  assert.ok(markup.includes('Verified Reviews'));
  assert.ok(markup.includes('Write a review'));
  assert.ok(markup.includes('data-form="review"'));
  assert.ok(markup.includes('name="reviewImages"'));
  assert.ok(markup.includes('accept="image/jpeg,image/png,image/webp"'));
  assert.ok(markup.includes('review moderation'));
});

test('only approved reviews for the selected flavour are displayed', () => {
  const { run } = storefront();
  const markup = run(`approvedReviewCards([
    { approved: true, flavour: 'Mawa Kulfi', name: 'Approved customer', rating: 5, text: 'A consistent part of my routine.' },
    { approved: false, flavour: 'Mawa Kulfi', name: 'Hidden customer', rating: 5, text: 'Not approved.' },
    { approved: true, flavour: 'Rich Chocolate', name: 'Other flavour', rating: 5, text: 'Not this product.' }
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

test('product reviews use a vertical verified list with ratings, dates and images', () => {
  const { run } = storefront();
  const markup = run(`reviewShowcase('product', [
    { approved: true, verified: true, flavour: 'Mawa Kulfi', name: 'Product customer', rating: 5, date: '19/09/2026', text: 'Creamy and easy to mix.', images: ['review-1.webp'] }
  ])`);
  assert.ok(markup.includes('verified-review-list'));
  assert.ok(markup.includes('Verified purchase'));
  assert.ok(markup.includes('19/09/2026'));
  assert.ok(markup.includes('review-1.webp'));
  assert.ok(!markup.includes('review-card-track'));
});
