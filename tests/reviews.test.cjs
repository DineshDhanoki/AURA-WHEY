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
