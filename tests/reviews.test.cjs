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
  assert.ok(markup.includes('Shopify review moderation'));
  assert.ok(!markup.includes('data-action="reviews-prev"'));
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

test('product reviews use compact horizontal cards with two-way controls', () => {
  const { run } = storefront();
  const markup = run(`reviewShowcase('product', [
    { approved: true, flavour: 'Mawa Kulfi', name: 'Product customer', rating: 5, text: 'Creamy and easy to mix.' }
  ])`);
  assert.ok(markup.includes('review-card-track'));
  assert.ok(markup.includes('data-action="reviews-prev"'));
  assert.ok(markup.includes('data-action="reviews-next"'));
});
