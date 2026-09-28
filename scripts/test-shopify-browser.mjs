import { createServer } from 'node:http';
import { readFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, extname, sep } from 'node:path';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve('.');
const live = process.argv.includes('--live');
const rewrites = JSON.parse(await readFile('vercel.json', 'utf8')).rewrites;
const server = createServer(async (req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const rewrite = rewrites.find(rule => new RegExp('^' + rule.source.replace(':slug', '[^/]+') + '$').test(name));
  const file = resolve(root, '.' + (rewrite?.destination || (name === '/' ? '/index.html' : name)));
  if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    let body = await readFile(file);
    if (name === '/shopify.js' && !live) body = Buffer.from(body.toString().replace(/publicAccessToken: '[^']*'/, "publicAccessToken: 'public-browser-fixture'"));
    res.setHeader('Content-Type', ({ '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.jpeg': 'image/jpeg', '.png': 'image/png', '.jpg': 'image/jpeg' })[extname(file)] || 'application/octet-stream');
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), 'aura-browser-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--remote-debugging-port=0', '--no-first-run', '--no-default-browser-check', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
try {
  const browserUrl = await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('Chrome startup timed out')), 15000);
    chrome.once('error', error => { clearTimeout(timer); reject(error); });
    chrome.stderr.on('data', chunk => {
      output += chunk;
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  socket = new WebSocket(browserUrl);
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome connection timed out')), 10000);
    socket.addEventListener('open', () => { clearTimeout(timeout); resolve(); }, { once: true });
    socket.addEventListener('error', () => { clearTimeout(timeout); reject(new Error('Chrome connection failed')); }, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id); pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++nextId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
  const target = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
  const command = (method, params) => send(method, params, sessionId);
  await command('Runtime.enable'); await command('Page.enable');
  if (!live) await command('Page.addScriptToEvaluateOnNewDocument', { source: await readFile('tests/shopify-browser-fixture.js', 'utf8') });
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  async function waitFor(expression) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(expression)) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Timed out: ' + expression);
  }
  await command('Page.navigate', { url: origin });
  await waitFor('typeof commerce !== "undefined" && !commerce.loading');
  assert.equal(await evaluate('commerce.error'), '');
  await evaluate("document.querySelector('a[data-route=shop]').click()");
  await waitFor("location.pathname === '/shop' && !!document.querySelector('.purchase-panel')");
  await evaluate('history.back()');
  await waitFor("location.pathname === '/' && !!document.querySelector('.hero-carousel')");
  await evaluate('history.forward()');
  await waitFor("location.pathname === '/shop' && !!document.querySelector('.purchase-panel')");
  await command('Page.reload');
  await waitFor('typeof commerce !== "undefined" && !commerce.loading');
  assert.equal(await evaluate("location.pathname === '/shop' && !!document.querySelector('.purchase-panel')"), true);
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate("navigate('shop')");
    await waitFor("!!document.querySelector('.purchase-panel')");
    assert.match(await evaluate("document.querySelector('.purchase-panel h2').textContent"), /Mawa Kulfi/);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `overflow at ${width}`);
    assert.equal(await evaluate("document.querySelector('[data-action=add-cart]').disabled"), false);
    assert.equal(await evaluate("document.querySelector('.product-zoom-controls').getBoundingClientRect().top >= document.querySelector('.product-main-image').getBoundingClientRect().bottom"), true, 'zoom controls overlap image');
    await evaluate(`(async () => {
      const img = document.querySelector('.product-main-photo');
      img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1600"><rect width="900" height="1600" fill="gold"/></svg>');
      await img.decode();
    })()`);
    assert.equal(await evaluate(`(() => {
      const frame = document.querySelector('.product-main-image').getBoundingClientRect();
      const photo = document.querySelector('.product-main-photo').getBoundingClientRect();
      return photo.top >= frame.top && photo.bottom <= frame.bottom + 1 && photo.left >= frame.left && photo.right <= frame.right + 1;
    })()`), true, 'portrait image exceeds gallery at ' + width);
  }
  for (const width of [320, 430, 1024, 1440]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    await evaluate("navigate('verify')");
    await waitFor("!!document.querySelector('[data-form=batch-verification]')");
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `verification overflow at ${width}`);
  }
  await evaluate("document.querySelector('[name=batch]').value = 'gn250508'; document.querySelector('[data-form=batch-verification]').requestSubmit()");
  await waitFor("document.querySelector('.batch-result-found')?.textContent.includes('SMP-050826008')");
  assert.equal(await evaluate("document.querySelector('.batch-result-found a').pathname.endsWith('/assets/SMP-050826010%20(Aura%20Whey).pdf')"), true);
  await evaluate("document.querySelector('[name=batch]').value = 'UNKNOWN'; document.querySelector('[data-form=batch-verification]').requestSubmit()");
  await waitFor("!!document.querySelector('.batch-result-unavailable')");
  assert.equal(await evaluate("document.querySelector('.batch-result-unavailable').textContent.includes('does not mean the product is fake')"), true);
  await command('Page.reload');
  await waitFor("location.pathname === '/verify' && !!document.querySelector('[data-form=batch-verification]')");
  await evaluate("navigate('shop')");
  await waitFor("!!document.querySelector('.purchase-panel')");
  await evaluate("document.querySelector('[data-action=add-cart]').click()");
  await waitFor("location.pathname === '/cart' && !!document.querySelector('.cart-item')");
  await evaluate("document.querySelector('[data-action=line-up]').click()");
  await waitFor('!commerce.busy && commerce.cart.totalQuantity === 2');
  await evaluate("handleAction('select-Rich Chocolate')");
  await waitFor("!!document.querySelector('.purchase-panel')");
  await evaluate("document.querySelector('[data-action=add-cart]').click()");
  await waitFor("document.querySelectorAll('.cart-item').length === 2");
  await evaluate("document.querySelector('[name=coupon]').value = 'DISC5'; document.querySelector('.coupon-form').requestSubmit()");
  await waitFor("!commerce.busy && commerce.cart.discountCodes[0]?.code === 'DISC5'");
  if (!live) assert.equal(await evaluate('commerce.cart.cost.totalAmount.amount'), '12252.15');
  else console.log('Live discount:', await evaluate('JSON.stringify(commerce.cart.discountCodes)'));
  await command('Page.reload');
  await waitFor('typeof commerce !== "undefined" && !commerce.loading && commerce.cart?.totalQuantity === 3');
  assert.equal(await evaluate("document.querySelectorAll('.cart-item').length"), 2);
  await evaluate("document.querySelector('[data-action=line-remove]').click()");
  await waitFor("!commerce.busy && document.querySelectorAll('.cart-item').length === 1");
  assert.deepEqual(errors, []);
  if (live) {
    const checkoutUrl = await evaluate('commerce.cart.checkoutUrl');
    await evaluate("document.querySelector('[data-action=checkout]').click()");
    await waitFor("location.hostname !== '127.0.0.1'");
    console.log('Checkout browser navigated to:', await evaluate('location.origin + location.pathname.substring(0, 14)'));
    await command('Page.navigate', { url: origin + '//cart' });
    await waitFor('typeof commerce !== "undefined" && !commerce.loading && !!commerce.cart');
    await evaluate("document.querySelector('[data-action=line-remove]').click()");
    await waitFor('!commerce.busy && commerce.cart.totalQuantity === 0');
    console.log('Live browser test cart emptied. Checkout URL was HTTPS:', checkoutUrl.startsWith('https:'));
  }
  console.log(`Chrome smoke passed (${live ? 'LIVE Shopify' : 'fixture responses'}): desktop/mobile, no overflow, actual clicks, multi-line cart, quantities, discounts, refresh, removal, no JS exceptions.`);
  send('Browser.close').catch(() => {});
} finally {
  socket?.close(); chrome.kill(); server.close();
}
