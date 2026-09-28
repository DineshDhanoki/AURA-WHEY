const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { storefront } = require('./storefront-helper.cjs');

test('saved cart restoration starts before products finish and startup refreshes once', async () => {
  const { context, run, storage } = storefront();
  let finishProducts;
  context.productRequest = new Promise(resolve => { finishProducts = resolve; });
  storage.set('aura-shopify-cart:cay9kn-xc.myshopify.com', 'saved-cart');
  run(`let cartStarted = false, refreshes = 0, fullRenders = 0;
    render = () => fullRenders++;
    refreshCommerceView = () => refreshes++;
    commerce.client.products = () => productRequest;
    commerce.client.cart = async () => { cartStarted = true; return null; };`);
  const loading = run('initCommerce()');
  assert.equal(run('cartStarted'), true);
  assert.equal(run('fullRenders'), 0);
  finishProducts(run('commerce.products'));
  await loading;
  assert.equal(run('refreshes'), 1);
  assert.equal(run('commerce.cartReady'), true);
});

test('all responsive gallery variants exist and thumbnails use a small slot', () => {
  const { run } = storefront();
  const sources = run('Object.values(productFlavours).flatMap(product => product.images)');
  for (const src of sources) {
    for (const width of [160, 640]) {
      const file = path.join(__dirname, '..', decodeURIComponent(src.replace('.webp', `-${width}.jpg`)));
      assert.ok(fs.statSync(file).size > 0, file);
    }
  }
  assert.match(run("image(assets.mawa, 'test', 'product-thumbnail')"), /sizes="88px"/);
});
