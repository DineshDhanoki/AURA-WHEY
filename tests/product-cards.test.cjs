const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { storefront } = require('./storefront-helper.cjs');
const root = path.resolve(__dirname, '..');

for (const flavour of ['Mawa Kulfi', 'Rich Chocolate']) {
  test(`${flavour}: navigation resets homepage scroll after rendering the selected product`, () => {
    const { context, events, run } = storefront();
    let rendered = '';
    let scrollTop = 1200;
    context.captureRender = html => { rendered = html; };
    run('render = () => captureRender(shop())');
    context.window.scrollTo = options => {
      assert.ok(rendered.includes(`Aura Whey ${flavour}`));
      assert.equal(options.behavior, 'instant');
      assert.equal(options.left, 0);
      scrollTop = options.top;
    };
    run(`handleAction('select-${flavour}')`);
    assert.equal(run('location.pathname'), '/shop');
    events.popstate();
    assert.equal(scrollTop, 0);
    scrollTop = 500;
    run('render()');
    assert.equal(scrollTop, 500, 'in-page renders preserve scroll position');
  });
}

for (const [flavour, theme] of [['Mawa Kulfi', 'flavour-kulfi'], ['Rich Chocolate', 'flavour-chocolate']]) {
  test(`${flavour}: card, product page and all five supplied assets`, () => {
    const { run } = storefront();
    const card = run(`productCard('${flavour}')`);
    assert.ok(card.includes(`product-card ${theme}`));
    assert.ok(card.includes(`data-action="add-flavour-${flavour}"`));
    assert.ok(card.includes(`data-action="select-${flavour}"`));
    assert.ok(card.includes('Add to cart'));
    assert.ok(card.includes('View product'));
    run(`state.flavour = '${flavour}'`);
    const page = run('shop()');
    assert.ok(page.includes(`product-page ${theme}`));
    assert.equal((page.match(/class="thumbnail"/g) || []).length, 5);
    assert.equal((page.match(/aria-pressed="true"/g) || []).length, 1);
    const images = run(`productFlavours['${flavour}'].images`);
    assert.equal(images.length, 5);
    for (const url of images) assert.ok(fs.existsSync(path.join(root, decodeURIComponent(url))), url);
  });

  test(`${flavour}: card add-to-cart keeps the selected flavour and price`, async () => {
    const { run } = storefront();
    await run(`handleAction('add-flavour-${flavour}')`);
    assert.equal(run('state.cart'), 1);
    assert.equal(run('location.pathname'), '/');
    assert.equal(Number(run('commerce.cart.cost.totalAmount.amount')), flavour === 'Mawa Kulfi' ? 4199 : 4499);
    assert.ok(run('cart()').includes(`Aura Whey ${flavour}`));
    await run("applyShopifyCoupon('DISC5')");
    assert.equal(Number(run('commerce.cart.cost.totalAmount.amount')), Number(((flavour === 'Mawa Kulfi' ? 4199 : 4499) * .95).toFixed(2)));
  });
}

test('gallery selection updates the image and pressed state without losing the current button', () => {
  const { context, run } = storefront();
  const img = {};
  const thumbnails = Array.from({ length: 5 }, () => ({ setAttribute(name, value) { this[name] = value; } }));
  context.document.querySelector = () => img;
  context.document.querySelectorAll = () => thumbnails;
  context.selectedThumbnail = thumbnails[3];
  run("handleAction('product-image-3', selectedThumbnail)");
  assert.equal(img.src, run('productFlavours[state.flavour].images[3]'));
  assert.equal(thumbnails[3]['aria-pressed'], 'true');
  assert.equal(thumbnails.filter(t => t['aria-pressed'] === 'true').length, 1);
  run("handleAction('select-Rich Chocolate')");
  assert.equal(run('state.productImage'), 0);
  assert.equal(run('location.pathname'), '/shop');
});

test('homepage keeps both cards and the existing five-slide hero', () => {
  const { run } = storefront();
  const markup = run('home()');
  assert.equal((markup.match(/class="card product-card /g) || []).length, 2);
  assert.equal(run('heroSlides.length'), 5);
  assert.ok(markup.includes('grid product-grid'));
});

test('product page includes responsive quick-purchase actions and Buy now opens checkout', async () => {
  const { run, redirects } = storefront();
  const markup = run('shop()');
  assert.ok(markup.includes('id="floating-purchase"'));
  assert.equal((markup.match(/data-action="buy-now"/g) || []).length, 2);
  assert.equal((markup.match(/data-action="add-cart"/g) || []).length, 2);
  await run("handleAction('buy-now')");
  assert.equal(run('state.cart'), 1);
  assert.equal(redirects[0], 'https://cay9kn-xc.myshopify.com/checkouts/test');
});

test('quick-purchase bar is shown only while the main purchase controls are off screen', () => {
  const { context, run } = storefront();
  const classes = new Set();
  const bar = {
    classList: { toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } },
    setAttribute(name, value) { this[name] = value; }
  };
  const gallery = {};
  const header = { getBoundingClientRect: () => ({ height: 130 }) };
  context.document.querySelector = selector => ({
    '.product-main-image': gallery,
    '#floating-purchase': bar,
    '.site-header': header
  })[selector] || null;
  let observerCallback;
  context.window.IntersectionObserver = class {
    constructor(callback) { observerCallback = callback; }
    observe() {}
    disconnect() {}
  };
  run('initFloatingPurchaseBar()');
  assert.ok(!classes.has('is-visible'), 'bar hidden while gallery is on screen');
  context.observerCallback = observerCallback;
  run('observerCallback([{ isIntersecting: true }])');
  assert.ok(!classes.has('is-visible'), 'bar stays hidden while gallery visible');
  assert.equal(bar['aria-hidden'], 'true');
  run('observerCallback([{ isIntersecting: false }])');
  assert.ok(classes.has('is-visible'), 'bar shown once gallery scrolled out');
  assert.equal(bar['aria-hidden'], 'false');
});

test('store FAQ renders a centered heading and the complete accordion', () => {
  const { run } = storefront();
  const markup = run('storeFaq()');
  assert.ok(markup.includes('class="store-faq-heading"'));
  assert.ok(markup.includes('<h2>Got questions?</h2>'));
  assert.ok(markup.includes('<p>Let\u2019s dive in.</p>'));
  assert.equal((markup.match(/data-action="faq-/g) || []).length, run('faqs.length'));
});

test('product page keeps its trailing sections inside the flavour theme', () => {
  const { run } = storefront();
  const markup = run('shop()');
  const closingProductPage = markup.lastIndexOf('</div>');
  assert.ok(markup.indexOf('Find your everyday flavour.') < closingProductPage);
  assert.ok(markup.indexOf('<h2>Got questions?</h2>') < closingProductPage);
});

test('Aura feedback scales up by quantity and tracks consecutive removals', () => {
  const { run } = storefront();
  run('state.quantity = 2');
  assert.equal(run("auraFeedback('aura-up')"), '+2000 AURA');
  run('state.quantity = 3');
  assert.equal(run("auraFeedback('quantity-up')"), '+3000 AURA');
  run('state.quantity = 2');
  assert.equal(run("auraFeedback('aura-down')"), '\u22121000 AURA');
  run('state.quantity = 1');
  assert.equal(run("auraFeedback('quantity-down')"), '\u22122000 AURA');
  run('state.quantity = 2');
  assert.equal(run("auraFeedback('aura-up')"), '+2000 AURA');
  assert.equal(run('state.auraDownStreak'), 0);
});

test('quality page includes the newly supplied test report and FDA facility registration', () => {
  const { run } = storefront();
  const markup = run('quality()');
  assert.ok(markup.includes('Independent protein test report'));
  assert.ok(markup.includes('assets/SMP-050826010%20(Aura%20Whey).pdf'));
  assert.ok(markup.includes('U.S. FDA facility registration'));
  assert.ok(markup.includes('assets/nutri-certi-6.webp'));
  assert.ok(markup.includes('not FDA product approval'));
  assert.ok(markup.includes('View certificate'));
  assert.equal(run('documents.length'), 9);
});

test('batch verification uses the supplied report and does not claim per-tub authentication', () => {
  const { run } = storefront();
  const page = run('verifyBatch()');
  assert.ok(page.includes('data-form="batch-verification"'));
  assert.ok(page.includes('not an individual product tub'));

  const result = run("batchReportResult(' gn250508 ')");
  for (const value of ['GN250508', 'Whey Protein Powder', 'July 2026', 'December 2027', 'Assure Analytical Laboratories LLP', 'SMP-050826008', '16-07-2026', '67.9%']) {
    assert.ok(result.includes(value), value);
  }
  assert.ok(result.includes('View Original Lab Report'));
  assert.ok(result.includes('assets/SMP-050826010%20(Aura%20Whey).pdf'));
  assert.ok(result.includes('does not authenticate an individual tub'));
});

test('unknown batches report missing documentation without calling the product fake', () => {
  const { run } = storefront();
  const result = run("batchReportResult('<unknown>')");
  assert.ok(result.includes('No laboratory report currently available'));
  assert.ok(result.includes('This does not mean the product is fake'));
  assert.ok(result.includes('&lt;UNKNOWN&gt;'));
  assert.ok(!result.includes('View Original Lab Report'));
});

test('legacy demo authentication codes and route are removed from the live storefront', () => {
  const appSource = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  const routes = fs.readFileSync(path.join(root, 'vercel.json'), 'utf8');
  assert.ok(!appSource.includes('AURA-2026-001'));
  assert.ok(!appSource.includes("routeLink('authenticate'"));
  assert.ok(!routes.includes('/authenticate'));
  assert.ok(routes.includes('/verify'));
});
