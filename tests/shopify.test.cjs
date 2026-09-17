const { test } = require('node:test');
const assert = require('node:assert/strict');
const { storefront } = require('./storefront-helper.cjs');

test('both products remain independent; updates, removal, totals and saved ID use the Shopify response', async () => {
  const { run, storage } = storefront();
  await run("addShopifyProduct('Mawa Kulfi', 2)");
  await run("addShopifyProduct('Rich Chocolate', 3)");
  assert.equal(run('commerce.cart.lines.nodes.length'), 2);
  assert.equal(run('state.cart'), 5);
  assert.equal(run('commerce.cart.cost.totalAmount.amount'), '21895.00');
  assert.equal(storage.get('aura-shopify-cart:cay9kn-xc.myshopify.com'), run('commerce.cart.id'));
  await run("changeCartLine('line-down', commerce.cart.lines.nodes[1].id)");
  assert.equal(run('commerce.cart.lines.nodes[0].quantity'), 2);
  assert.equal(run('commerce.cart.lines.nodes[1].quantity'), 2);
  await run("changeCartLine('line-remove', commerce.cart.lines.nodes[0].id)");
  assert.equal(run('state.cart'), 2);
  assert.ok(run('cart()').includes('Aura Whey Rich Chocolate'));
  await run("changeCartLine('line-remove', commerce.cart.lines.nodes[0].id)");
  assert.equal(run('state.cart'), 0);
});

test('failed mutations preserve cart contents and release loading state', async () => {
  const { run } = storefront();
  await run("addShopifyProduct('Mawa Kulfi', 2)");
  run("commerce.client.update = async () => { throw new Error('Stock limit reached'); }");
  await run("changeCartLine('line-up', commerce.cart.lines.nodes[0].id)");
  assert.equal(run('commerce.cart.lines.nodes[0].quantity'), 2);
  assert.equal(run('commerce.busy'), false);
  assert.equal(run('commerce.error'), 'Stock limit reached');
});

test('unavailable variants and repeated clicks cannot create extra cart requests', async () => {
  const { context, run } = storefront();
  run("commerce.products['Mawa Kulfi'].variants.nodes[0].availableForSale = false");
  await run("addShopifyProduct('Mawa Kulfi', 1)");
  assert.equal(run('state.cart'), 0);
  assert.match(run("purchaseButton('add-cart', 'Add to cart')"), /disabled/);
  run("commerce.products['Mawa Kulfi'].variants.nodes[0].availableForSale = true");
  let resolve;
  context.pending = new Promise(r => { resolve = r; });
  run('let calls = 0; const originalCreate = commerce.client.create; commerce.client.create = async (...args) => { calls++; await pending; return originalCreate(...args); };');
  const first = run("addShopifyProduct('Mawa Kulfi', 1)");
  await run("addShopifyProduct('Mawa Kulfi', 1)");
  assert.equal(run('calls'), 1);
  resolve(); await first;
  assert.equal(run('state.cart'), 1);
});

test('coupons are only marked applied when Shopify confirms applicability', async () => {
  const { run } = storefront();
  await run("handleAction('apply-coupon')");
  assert.match(run('couponEntry()'), /will validate/);
  await run("addShopifyProduct('Mawa Kulfi', 1)");
  assert.match(run('commerce.couponMessage'), /applied/);
  await run("applyShopifyCoupon('INVALID')");
  assert.match(run('commerce.couponMessage'), /not applicable/);
  assert.equal(run('commerce.cart.cost.totalAmount.amount'), '4199.00');
  await run("applyShopifyCoupon('')");
  assert.equal(run('commerce.cart.discountCodes.length'), 0);
});

test('initialization preserves square artwork, hydrates product data and restores an existing cart', async () => {
  const { run, storage } = storefront();
  await run("addShopifyProduct('Mawa Kulfi', 2)");
  run(`commerce.client.products = async () => Object.fromEntries(Object.entries(commerce.products).map(([name, product]) => [name, {
    ...product, title: '<Live & title>', images: { nodes: [{ url: 'https://cdn.shopify.com/test.jpg' }] }
  }])); commerce.cart = null; state.cart = 0;`);
  await run('initCommerce()');
  assert.equal(run('state.cart'), 2);
  assert.equal(run("productFlavours['Mawa Kulfi'].images[0]"), './assets/optimized/site/MK%20Card/Malai%20Kulfi%201.1.webp');
  assert.equal(run('liveTitle()'), '&lt;Live &amp; title&gt;');
  assert.equal(run('commerce.loading'), false);
  run('commerce.client.cart = async () => null');
  await run('initCommerce()');
  assert.equal(run('state.cart'), 0);
  assert.equal(storage.size, 0);
});

test('checkout refreshes the cart and uses returned HTTPS URL including its query parameters', async () => {
  const { run, redirects } = storefront();
  await run("addShopifyProduct('Rich Chocolate', 1)");
  run("fixtureCart.checkoutUrl = 'https://cay9kn-xc.myshopify.com/checkouts/test?key=abc'");
  await run('openShopifyCheckout()');
  assert.equal(redirects[0], 'https://cay9kn-xc.myshopify.com/checkouts/test?key=abc');
  run("fixtureCart.checkoutUrl = 'javascript:alert(1)'");
  await run('openShopifyCheckout()');
  assert.equal(redirects.length, 1);
});

test('API client sends handle variables, public header and pinned version; missing token makes no request', async () => {
  const { context, run } = storefront();
  const requests = [];
  context.requestFixture = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => ({ data: { product: { handle: JSON.parse(options.body).variables.handle, variants: { pageInfo: { hasNextPage: false } } } } }) };
  };
  await assert.rejects(run("createShopifyClient({ ...SHOPIFY_CONFIG, publicAccessToken: '' }, requestFixture).products()"), /token is missing/);
  assert.equal(requests.length, 0);
  const products = await run("createShopifyClient({ ...SHOPIFY_CONFIG, publicAccessToken: 'public-test-token' }, requestFixture).products()");
  assert.equal(products['Rich Chocolate'].handle, 'aura-whey-rich-chocolate-1-kg');
  assert.equal(products['Mawa Kulfi'].handle, 'aura-whey-mawa-kulfi-1-kg');
  assert.equal(requests.length, 2);
  assert.match(requests[0].url, /\/api\/2026-07\/graphql.json$/);
  assert.equal(requests[0].options.headers['X-Shopify-Storefront-Access-Token'], 'public-test-token');
  assert.equal(JSON.parse(requests[0].options.body).variables.country, 'IN');
});

test('API mutations pass IDs and quantities and surface GraphQL/user errors', async () => {
  const { context, run } = storefront();
  const calls = [];
  context.requestFixture = async (url, options) => {
    const body = JSON.parse(options.body); calls.push(body);
    const name = body.query.match(/\{ (cart\w+)\(/)[1];
    return { ok: true, json: async () => ({ data: { [name]: { cart: { id: 'cart-1', lines: { pageInfo: { hasNextPage: false } } }, userErrors: [], warnings: [] } } }) };
  };
  run("const apiTest = createShopifyClient({ ...SHOPIFY_CONFIG, publicAccessToken: 'public-test-token' }, requestFixture)");
  await run("apiTest.create([{ merchandiseId: 'variant-1', quantity: 2 }], ['DISC5'])");
  await run("apiTest.add('cart-1', [{ merchandiseId: 'variant-2', quantity: 1 }])");
  await run("apiTest.update('cart-1', [{ id: 'line-1', quantity: 3 }])");
  await run("apiTest.remove('cart-1', ['line-1'])");
  await run("apiTest.discount('cart-1', ['DISC5'])");
  assert.equal(calls[0].variables.input.lines[0].quantity, 2);
  assert.equal(calls[0].variables.input.buyerIdentity.countryCode, 'IN');
  assert.equal(calls[2].variables.lines[0].id, 'line-1');
  assert.deepEqual(calls[3].variables.lineIds, ['line-1']);
  context.errorFixture = async () => ({ ok: true, json: async () => ({ data: { cartCreate: { userErrors: [{ message: 'Not enough stock' }] } } }) });
  await assert.rejects(run("createShopifyClient({ ...SHOPIFY_CONFIG, publicAccessToken: 'public-test-token' }, errorFixture).create([])"), /Not enough stock/);
  context.errorFixture = async () => ({ ok: false, status: 401, json: async () => ({ errors: [{ message: 'Access denied' }] }) });
  await assert.rejects(run("createShopifyClient({ ...SHOPIFY_CONFIG, publicAccessToken: 'public-test-token' }, errorFixture).products()"), /Access denied/);
});
