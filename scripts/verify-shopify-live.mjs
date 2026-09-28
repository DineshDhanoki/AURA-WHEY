import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const context = vm.createContext({ fetch, AbortController, setTimeout, clearTimeout });
vm.runInContext(await readFile('shopify.js', 'utf8'), context);
const config = vm.runInContext('SHOPIFY_CONFIG', context);
const client = vm.runInContext('createShopifyClient(SHOPIFY_CONFIG)', context);
const products = await client.products();
console.log('Products:', Object.values(products).map(product => ({ handle: product.handle, title: product.title, images: product.images.nodes.length, variants: product.variants.nodes.map(v => ({ id: v.id, price: v.price, available: v.availableForSale })) })));
const response = await fetch(`https://${config.domain}/api/${config.apiVersion}/graphql.json`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': config.publicAccessToken },
  body: JSON.stringify({ query: 'query($ids: [ID!]!) { nodes(ids: $ids) { ... on ProductVariant { id availableForSale quantityAvailable currentlyNotInStock } } }', variables: { ids: Object.values(products).map(product => product.variants.nodes[0].id) } })
});
console.log('Inventory:', JSON.stringify(await response.json()));
let cart;
try {
  let result = await client.create([{ merchandiseId: products['Rich Chocolate'].variants.nodes[0].id, quantity: 1 }]);
  cart = result.cart;
  assert.equal(cart.totalQuantity, 1);
  console.log('Create cart: passed', 'warnings:', result.warnings);
  result = await client.add(cart.id, [{ merchandiseId: products['Mawa Kulfi'].variants.nodes[0].id, quantity: 1 }]);
  cart = result.cart;
  assert.equal(cart.lines.nodes.length, 2);
  assert.equal(cart.totalQuantity, 2);
  cart = (await client.update(cart.id, [{ id: cart.lines.nodes[0].id, quantity: 2 }])).cart;
  assert.equal(cart.totalQuantity, 3);
  console.log('Add both products and update quantity: passed');
  cart = (await client.discount(cart.id, ['AURA-INVALID-VERIFY-2026'])).cart;
  assert.equal(cart.discountCodes[0].applicable, false);
  console.log('Invalid discount rejected: passed');
  cart = (await client.discount(cart.id, ['DISC5'])).cart;
  console.log('DISC5:', JSON.stringify(cart.discountCodes), 'cost:', JSON.stringify(cart.cost));
  if (cart.discountCodes[0].applicable) assert.equal(Number(cart.cost.totalAmount.amount), 11967.15);
  else console.log('CONFIGURATION ISSUE: DISC5 is not applicable to this cart.');
  const restored = await client.cart(cart.id);
  assert.equal(restored.totalQuantity, 3);
  const checkout = new URL(restored.checkoutUrl);
  assert.equal(checkout.protocol, 'https:');
  console.log('Cart retrieval and checkout URL: passed', checkout.origin + checkout.pathname.replace(/\/cn\/.*/, '/cn/[redacted]'));
  const checkoutResponse = await fetch(checkout, { redirect: 'follow' });
  const html = await checkoutResponse.text();
  console.log('Checkout HTTP:', checkoutResponse.status, 'final origin:', new URL(checkoutResponse.url).origin,
    'title:', html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim(),
    'password page:', new URL(checkoutResponse.url).pathname.includes('password'));
  assert.equal(checkoutResponse.ok, true);
  cart = (await client.remove(cart.id, [cart.lines.nodes[0].id])).cart;
  assert.equal(cart.lines.nodes.length, 1);
  console.log('Remove line: passed');
} finally {
  if (cart?.lines.nodes.length) {
    await client.remove(cart.id, cart.lines.nodes.map(line => line.id));
    console.log('Verification cart emptied; no order placed.');
  }
}
