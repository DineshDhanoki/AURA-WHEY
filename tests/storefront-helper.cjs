const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function storefront() {
  const events = {};
  const storage = new Map();
  const notices = [];
  const redirects = [];
  const context = vm.createContext({
    document: { querySelector: () => null, querySelectorAll: () => [], readyState: 'loading', addEventListener() {} },
    window: { scrollTo() {}, location: { assign: url => redirects.push(url) }, addEventListener(name, handler) { events[name] = handler; } },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    location: { pathname: '/', origin: 'http://localhost' }, URL, AbortController, setTimeout, clearTimeout, Uint8Array,
    crypto: require('node:crypto').webcrypto,
    btoa: value => Buffer.from(value, 'binary').toString('base64'),
    console: { warn: (...args) => notices.push(args.join(' ')) },
    fetch: () => { throw new Error('Unstubbed network call'); }
  });
  context.history = { pushState: (_, unused, path) => { context.location.pathname = path; } };
  vm.runInContext(fs.readFileSync(path.join(root, 'shopify.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'batch-reports.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), context);
  const run = code => vm.runInContext(code, context);
  run(`render = () => {}; showToast = message => console.warn(message);
    commerce.loading = false; commerce.cartReady = true;
    for (const flavour of Object.keys(productFlavours)) {
      const id = 'gid://shopify/ProductVariant/' + (flavour === 'Mawa Kulfi' ? '1' : '2');
      commerce.products[flavour] = { title: 'Aura Whey ' + flavour, description: 'Live description',
        selectedVariantId: id, variants: { nodes: [{ id, title: 'Default Title', availableForSale: true,
          price: { amount: flavour === 'Mawa Kulfi' ? '4199.00' : '4499.00', currencyCode: 'INR' } }] } };
    }
    let fixtureCart = { id: 'gid://shopify/Cart/test?key=secret', checkoutUrl: 'https://cay9kn-xc.myshopify.com/checkouts/test',
      totalQuantity: 0, discountCodes: [], lines: { nodes: [], pageInfo: { hasNextPage: false } }, cost: {} };
    function recalculate() {
      fixtureCart.totalQuantity = fixtureCart.lines.nodes.reduce((total, line) => total + line.quantity, 0);
      let subtotal = 0;
      for (const line of fixtureCart.lines.nodes) {
        const amount = Number(line.merchandise.price.amount) * line.quantity;
        line.cost = { totalAmount: { amount: String(amount), currencyCode: 'INR' } }; subtotal += amount;
      }
      fixtureCart.cost = { subtotalAmount: { amount: String(subtotal), currencyCode: 'INR' },
        totalAmount: { amount: (subtotal * (fixtureCart.discountCodes.some(c => c.applicable) ? .95 : 1)).toFixed(2), currencyCode: 'INR' } };
      return { cart: structuredCloneFixture(fixtureCart), warnings: [] };
    }
    function structuredCloneFixture(value) { return JSON.parse(JSON.stringify(value)); }
    function addFixture(lines) {
      for (const input of lines) {
        const found = fixtureCart.lines.nodes.find(line => line.merchandise.id === input.merchandiseId);
        if (found) found.quantity += input.quantity;
        else {
          const flavour = Object.keys(commerce.products).find(name => commerce.products[name].selectedVariantId === input.merchandiseId);
          const product = commerce.products[flavour];
          fixtureCart.lines.nodes.push({ id: 'line-' + input.merchandiseId, quantity: input.quantity,
            merchandise: { ...product.variants.nodes[0], product: { title: product.title, handle: SHOPIFY_CONFIG.products[flavour] } } });
        }
      }
      return recalculate();
    }
    commerce.client = {
      create: async (lines, codes) => { fixtureCart.discountCodes = codes.map(code => ({ code, applicable: code === 'DISC5' })); return addFixture(lines); },
      add: async (id, lines) => addFixture(lines),
      update: async (id, lines) => { for (const input of lines) fixtureCart.lines.nodes.find(line => line.id === input.id).quantity = input.quantity; return recalculate(); },
      remove: async (id, ids) => { fixtureCart.lines.nodes = fixtureCart.lines.nodes.filter(line => !ids.includes(line.id)); return recalculate(); },
      discount: async (id, codes) => { fixtureCart.discountCodes = codes.map(code => ({ code, applicable: code === 'DISC5' })); return recalculate(); },
      cart: async () => recalculate().cart
    };`);
  return { context, events, run, storage, redirects, notices };
}
module.exports = { storefront };
