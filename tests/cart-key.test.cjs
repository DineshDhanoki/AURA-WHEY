const { test } = require('node:test');
const assert = require('node:assert/strict');
const { storefront } = require('./storefront-helper.cjs');

// Boots a real DOM, hydrates a cart, and empties it — the path the user reports as broken.
test('emptying the last cart line swaps the cart page to the empty state', async () => {
  const { run } = storefront();
  await run("addShopifyProduct('Mawa Kulfi', 1)");
  assert.equal(run('state.cart'), 1);
  assert.ok(run('cart()').includes('cart-layout'));

  await run("changeCartLine('line-remove', commerce.cart.lines.nodes[0].id)");
  assert.equal(run('commerce.cart.lines.nodes.length'), 0);
  assert.equal(run('state.cart'), 0);

  const markup = run('cart()');
  assert.ok(markup.includes('Nothing here yet.'));
  assert.ok(!markup.includes('cart-layout'));
});
