const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('app.js', 'utf8');
const announcement = source.slice(source.indexOf('<div class="coupon-wrap"'), source.indexOf('<div class="header">'));

test('announcement keeps DISC5 action while advertising the approved 10% offer', () => {
  assert.match(announcement, /data-action="apply-coupon"/);
  assert.equal((announcement.match(/DISC5/g) || []).length, 3);
  assert.equal((announcement.match(/10% off on all orders/g) || []).length, 2);
  assert.doesNotMatch(announcement, /5% OFF|5% off/i);
});

test('announcement removes COD only and preserves the other repeated messages', () => {
  assert.doesNotMatch(announcement, /Cash on Delivery|CASH ON DELIVERY|\(COD\)/i);
  assert.equal((announcement.match(/FREE EXPRESS DELIVERY ACROSS INDIA OVER/g) || []).length, 2);
  assert.equal((announcement.match(/100% GENUINE & NABL LAB TESTED/g) || []).length, 2);
});
