const { test } = require('node:test');
const assert = require('node:assert/strict');
const { storefront } = require('./storefront-helper.cjs');

test('product page includes delivery options below the purchase controls', () => {
  const { run } = storefront();
  const markup = run('shop()');
  assert.ok(markup.includes('id="delivery-options-title"'));
  assert.ok(markup.includes('data-form="delivery-check"'));
  assert.ok(markup.includes('name="pincode"'));
  assert.ok(markup.includes('Free shipping on orders above \u20b92,000'));
  assert.ok(markup.includes('Replacement and cancellation policy'));
});

test('delivery options preserve a validated pincode state between renders', () => {
  const { run } = storefront();
  run("state.delivery = { pincode: '400001', status: 'ready', message: 'Delivery available · Estimated delivery 2 days.' }");
  const markup = run('deliveryOptions()');
  assert.ok(markup.includes('value="400001"'));
  assert.ok(markup.includes('Delivery available'));
});

test('coupon and delivery controls share the same responsive action row', () => {
  const { run } = storefront();
  assert.ok(run('couponEntry()').includes('class="inline-action-row"'));
  assert.ok(run('deliveryOptions()').includes('class="inline-action-row"'));
});
