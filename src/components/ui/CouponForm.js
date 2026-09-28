export function CouponForm(state) {
  const result = state.coupon === 'DISC5' ? 'DISC5 is applied. Your 5% offer will be reflected at checkout.' : state.coupon ? 'That code is not recognised. Try DISC5.' : 'Have a code? Apply it before checkout.';
  return `<form class="coupon-form" data-form="coupon"><label class="field">Coupon code<input name="coupon" value="${state.coupon}" placeholder="Enter coupon code" /></label><button type="submit" class="button">Apply</button></form><div class="coupon-result" aria-live="polite">${result}</div>`;
}
