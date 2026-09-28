const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { storefront } = require('./storefront-helper.cjs');

test('both flavours expose a keyboard-accessible viewer for the selected image', () => {
  const { run } = storefront();
  for (const flavour of ['Mawa Kulfi', 'Rich Chocolate']) {
    run(`state.flavour = '${flavour}'; state.productImage = 3`);
    const html = run('shop()');
    assert.ok(html.includes('data-image-viewer'));
    assert.ok(html.includes(`aria-label="Open ${flavour} image viewer"`));
    assert.ok(html.includes(run('productFlavours[state.flavour].images[3]')));
  }
});

test('viewer zooms, clamps mouse/touch dragging, resets and restores focus', () => {
  const node = () => ({
    handlers: {}, style: {}, classList: { add() {}, remove() {}, toggle() {} },
    addEventListener(name, fn) { this.handlers[name] = fn; },
    setAttribute() {}, focus() { this.focused = true; }
  });
  const photo = { ...node(), naturalWidth: 1000, naturalHeight: 1000 };
  const stage = { ...node(), clientWidth: 500, clientHeight: 500,
    querySelector: () => photo, setPointerCapture(id) { this.capture = id; },
    hasPointerCapture(id) { return this.capture === id; }, releasePointerCapture() { this.capture = null; } };
  const controls = { in: {}, out: {}, output: {} };
  const dialog = { ...node(), querySelector(selector) {
    return selector === '.viewer-stage' ? stage : selector === 'output' ? controls.output : controls[selector.includes('"out"') ? 'out' : 'in'];
  }, showModal() { this.open = true; }, close() { this.open = false; this.handlers.close(); } };
  const document = { ...node(), body: { ...node(), append() {} }, createElement: () => dialog };
  const window = node();
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../product-viewer.js'), 'utf8'), { document, window });
  const opener = { ...node(), isConnected: true, querySelector: () => ({ src: 'mawa.webp', alt: 'Mawa Kulfi' }) };
  const open = () => document.handlers.click({ target: { closest: () => opener } });
  const click = action => dialog.handlers.click({ target: { closest: () => ({ dataset: { viewer: action } }) } });
  open();
  assert.equal(photo.src, 'mawa.webp');
  assert.equal(controls.out.disabled, true);
  click('in'); click('in');
  assert.equal(controls.output.textContent, '200%');
  for (const pointerType of ['mouse', 'touch']) {
    stage.handlers.pointerdown({ pointerId: 1, pointerType, isPrimary: true, button: 0, clientX: 0, clientY: 0, preventDefault() {} });
    stage.handlers.pointermove({ pointerId: 1, clientX: 900, clientY: -900 });
    assert.equal(photo.style.transform, 'translate(250px, -250px) scale(2)');
    stage.handlers.pointerup({ pointerId: 1 });
    assert.equal(stage.capture, null);
  }
  click('reset');
  assert.equal(photo.style.transform, 'translate(0px, 0px) scale(1)');
  for (let i = 0; i < 10; i++) click('in');
  assert.equal(controls.output.textContent, '400%');
  assert.equal(controls.in.disabled, true);
  click('out');
  assert.equal(controls.output.textContent, '350%');
  click('close');
  assert.equal(opener.focused, true);
  opener.querySelector = () => ({ src: 'chocolate.webp', alt: 'Rich Chocolate' });
  open();
  assert.equal(photo.src, 'chocolate.webp');
  assert.equal(controls.output.textContent, '100%');
});
