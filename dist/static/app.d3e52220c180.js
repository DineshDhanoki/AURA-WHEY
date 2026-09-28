const links = [
  ['home', 'Home'], ['shop', 'Shop'], ['quality', 'Quality & lab reports'],
  ['blog', 'Journal'], ['verify', 'Verify batch'], ['track-order', 'Track order'],
  ['faq', 'FAQs'], ['contact', 'Contact']
];

const app = document.querySelector('#app');
const batchReports = globalThis.AURA_BATCH_REPORTS || Object.freeze({});
const assetBase = './stitch_aura_whey_storefront_design/';
const assets = {
  hero: [
    './assets/Hero%20section/ChatGPT%20Image%20Sep%209%2C%202026%2C%2002_08_34%20AM.png',
    './assets/Hero%20section/ChatGPT%20Image%20Sep%209%2C%202026%2C%2002_11_54%20AM.png',
    './assets/Hero%20section/ChatGPT%20Image%20Sep%209%2C%202026%2C%2002_08_58%20AM.png',
    './assets/Hero%20section/ChatGPT%20Image%20Sep%209%2C%202026%2C%2002_10_27%20AM.png',
    './assets/Hero%20section/ChatGPT%20Image%20Sep%209%2C%202026%2C%2002_10_32%20AM.png'
  ],
  chocolate: './assets/optimized/site/RC%20Card/Rich%20Chocolate%201.1.webp',
  mawa: './assets/optimized/site/MK%20Card/Malai%20Kulfi%201.1.webp',
  duo: `${assetBase}chatgpt_image_aug_15_2026_02_33_29_pm.png/screen.png`,
  labelMawa: `${assetBase}whatsapp_image_2026_07_22_at_21.31.00.jpeg/screen.png`,
  why: './assets/optimized/site/image.webp'
};

const productFlavours = {
  'Mawa Kulfi': {
    theme: 'flavour-kulfi',
    images: [assets.mawa, ...['Malai Kulfi 1.2.webp', 'Malai Kulfi 1.3.webp', 'Malai Kulfi 2.webp', 'Malai Kulfi 3.webp'].map(file => `./assets/optimized/site/MK%20Card/${encodeURIComponent(file)}`)]
  },
  'Rich Chocolate': {
    theme: 'flavour-chocolate',
    images: [assets.chocolate, ...['Rich Chocolate 1.2.webp', 'Rich chocolate 1.3.webp', 'Rich Chololate2.webp', 'Rich Chocolate 3.webp'].map(file => `./assets/optimized/site/RC%20Card/${encodeURIComponent(file)}`)]
  }
};

const heroSlides = [
  {
    id: 'flavour-combo',
    title: 'Aura Whey flavour combination',
    alt: 'Aura Whey Rich Chocolate and Mawa Kulfi protein tubs',
    desktopImage: assets.hero[0],
    mobileImage: '',
    link: '/shop'
  },
  {
    id: 'rich-chocolate',
    title: 'Aura Whey Rich Chocolate',
    alt: 'Aura Whey Rich Chocolate protein promotional banner',
    desktopImage: assets.hero[1],
    mobileImage: '',
    link: '/shop'
  },
  {
    id: 'mawa-kulfi',
    title: 'Aura Whey Mawa Kulfi',
    alt: 'Aura Whey Mawa Kulfi protein promotional banner',
    desktopImage: assets.hero[2],
    mobileImage: '',
    link: '/shop'
  },
  {
    id: 'training-benefits',
    title: 'Why choose Aura Whey',
    alt: 'Aura Whey protein tubs with athlete and product benefits',
    desktopImage: assets.hero[3],
    mobileImage: '',
    link: '/shop'
  },
  {
    id: 'performance-routine',
    title: 'Fuel your Aura Whey routine',
    alt: 'Aura Whey protein tubs with athlete and performance benefits',
    desktopImage: assets.hero[4],
    mobileImage: '',
    link: '/shop'
  }
];

heroSlides.forEach((slide, index) => {
  const desktopTimes = ['02_08_34', '02_11_54', '02_08_58', '02_10_27', '02_10_32'];
  const mobileTimes = ['03_42_35', '03_54_34', '03_42_45', '03_42_48', '03_42_51'];
  slide.desktopImage = './assets/Hero%20section/desktop/' + encodeURIComponent(`ChatGPT Image Sep 9, 2026, ${desktopTimes[index]} AM(1).png`);
  slide.mobileImage = './assets/Hero%20section/mobile%20hero%20page%20images/' + encodeURIComponent(`ChatGPT Image Sep 12, 2026, ${mobileTimes[index]} AM.png`);
  slide.desktopImage = slide.desktopImage.replace(/\.png$/, '.jpg');
  slide.mobileImage = slide.mobileImage.replace(/\.png$/, '.jpg');
  slide.ambientImage = `./assets/optimized/ambient-${index}.webp`;
  assets.hero[index] = slide.desktopImage;
});

const state = {
  flavour: 'Mawa Kulfi', productImage: 0, imageZoom: 1, quantity: 1, tab: 'Details', cart: 0, coupon: '',
  couponOpen: true, searchQuery: '', heroSlide: 0, theme: localStorage.getItem('aura-theme') || 'dark',
  delivery: { pincode: '', status: 'idle', message: '' },
  document: 'FSSAI licence', auraDownStreak: 0
};
const customerAccount = { loading: true, authenticated: false, customer: null, error: '' };

const svg = (paths) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const icon = (name) => ({
  search: svg('<circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path>'),
  account: svg('<circle cx="12" cy="8" r="3.5"></circle><path d="M4.5 20c.9-3.4 3.3-5.2 7.5-5.2s6.6 1.8 7.5 5.2"></path>'),
  bag: svg('<path d="M5.5 8.5h13l-1 11h-11l-1-11Z"></path><path d="M8.5 9V7a3.5 3.5 0 0 1 7 0v2"></path>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"></path>'),
  close: svg('<path d="m6 6 12 12M18 6 6 18"></path>'),
  moon: svg('<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"></path>'),
  sun: svg('<circle cx="12" cy="12" r="3.5"></circle><path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3"></path>'),
  arrowLeft: svg('<path d="m14.5 5-7 7 7 7"></path>'),
  arrowRight: svg('<path d="m9.5 5 7 7-7 7"></path>'),
  chevron: svg('<path d="m7 10 5 5 5-5"></path>'),
  check: svg('<path d="m5 12 4.2 4.2L19 6.7"></path>'),
  file: svg('<path d="M6 3.5h8l4 4V20.5H6z"></path><path d="M14 3.5v4h4M9 12h6M9 16h6"></path>'),
  instagram: svg('<rect x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="12" cy="12" r="3.5"></circle><path d="M17.5 6.5h.01"></path>'),
  facebook: svg('<path d="M14 21v-8h2.8l.4-3H14V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.6-.1-1.3-.2-2.2-.2-2.3 0-3.8 1.4-3.8 4V10H8.5v3H11v8"></path>'),
  linkedin: svg('<path d="M6.5 9.5V18M6.5 6.5v.1M10.5 18v-5.1c0-2.3 4.5-2.5 4.5 0V18M10.5 12.1V9.5M15 12.1V9.5"></path><rect x="3" y="3" width="18" height="18" rx="2"></rect>'),
  youtube: svg('<path d="M20.4 7.1c-.2-1-1-1.8-2-2C16.6 4.7 7.4 4.7 5.6 5.1c-1 .2-1.8 1-2 2-.4 1.8-.4 8 0 9.8.2 1 1 1.8 2 2 1.8.4 11 .4 12.8 0 1-.2 1.8-1 2-2 .4-1.8.4-8 0-9.8Z"></path><path d="m10 9 5 3-5 3Z"></path>')
  ,mapPin: svg('<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"></path><circle cx="12" cy="10" r="2.3"></circle>'),
  truck: svg('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"></path><circle cx="7" cy="18" r="1.7"></circle><circle cx="18" cy="18" r="1.7"></circle>'),
  trash: svg('<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13.5h9l1-13.5M10 11v6M14 11v6"></path>'),
  refresh: svg('<path d="M20 11a8 8 0 0 0-14.6-4L3 10M3 5v5h5M4 13a8 8 0 0 0 14.6 4L21 14m0 5v-5h-5"></path>')
}[name] || '');

const routeLink = (route, label, className = '') => `<a href="/${route}" class="${className}" data-route="${route}">${label}</a>`;
const iconLink = (route, name, label, className = '') => routeLink(route, `${icon(name)}<span class="sr-only">${label}</span>`, `icon-button ${className}`);
const button = (action, label, className = '', iconName = '') => `<button type="button" class="button ${className}" data-action="${action}">${iconName ? icon(iconName) : ''}<span>${label}</span></button>`;
const image = (src, alt, className = '') => {
  if (!src) return '<span class="small">Image unavailable</span>';
  const gallery = /optimized\/site\/(MK|RC)%20Card\/.*\.webp$/.test(src);
  const responsive = gallery ? ` srcset="${escapeHtml(src.replace('.webp', '-160.jpg'))} 160w, ${escapeHtml(src.replace('.webp', '-640.jpg'))} 640w, ${escapeHtml(src)} 1254w" sizes="${className === 'product-thumbnail' ? '88px' : '(max-width: 768px) 90vw, 600px'}" width="1254" height="1254"` : '';
  return `<img class="${className}" src="${escapeHtml(src)}"${responsive} alt="${escapeHtml(alt)}" loading="${className === 'product-main-photo' ? 'eager' : 'lazy'}" ${className === 'product-main-photo' ? 'fetchpriority="high"' : ''} decoding="async" />`;
};
const commerce = { client: createShopifyClient(SHOPIFY_CONFIG), products: {}, cart: null, cartReady: false, loading: true, busy: false, pendingPurchase: null, error: '', couponMessage: '' };
const cartStorageKey = 'aura-shopify-cart:' + SHOPIFY_CONFIG.domain;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const formatMoney = money => money ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: money.currencyCode }).format(Number(money.amount)) : '\u2014';
function selectedVariant(flavour = state.flavour) {
  const product = commerce.products[flavour];
  return product?.variants.nodes.find(variant => variant.id === product.selectedVariantId);
}
function liveTitle(flavour = state.flavour) { return escapeHtml(commerce.products[flavour]?.title || 'Aura Whey ' + flavour); }
function livePrice(flavour = state.flavour) { return formatMoney(selectedVariant(flavour)?.price); }
function purchaseButton(action, label, className = '', iconName = '', flavour = state.flavour) {
  const available = selectedVariant(flavour)?.availableForSale;
  const disabled = commerce.loading || commerce.busy || !commerce.cartReady || !available;
  const purchaseAction = action === 'buy-now' ? 'buy' : 'add';
  const active = commerce.busy && commerce.pendingPurchase?.action === purchaseAction && commerce.pendingPurchase.flavour === flavour;
  const text = commerce.loading ? 'Loading\u2026' : active ? (purchaseAction === 'buy' ? 'Opening checkout\u2026' : 'Adding\u2026') : !available ? (commerce.products[flavour] ? 'Sold out' : 'Unavailable') : label;
  return button(action, text, className, iconName).replace('<button ', '<button ' + (disabled ? 'disabled ' : ''));
}
function commerceStatus() {
  return commerce.loading ? '<p class="small" role="status">Loading products\u2026</p>' : commerce.error ? '<div class="result state-invalid" role="alert">We could not update the store. Please try again. ' + button('retry-shopify', 'Retry') + '</div>' : '';
}
function variantPicker() {
  const product = commerce.products[state.flavour];
  if (!product || product.variants.nodes.length < 2) return '';
  return '<label class="field">Choose option<select data-variant-select>' + product.variants.nodes.map(variant => '<option value="' + escapeHtml(variant.id) + '" ' + (variant.id === product.selectedVariantId ? 'selected' : '') + '>' + escapeHtml(variant.title) + (variant.availableForSale ? '' : ' \u2014 Sold out') + '</option>').join('') + '</select></label>';
}

function acceptCart(cart) {
  commerce.cart = cart;
  state.cart = cart?.totalQuantity || 0;
  try {
    if (cart) localStorage.setItem(cartStorageKey, cart.id);
    else localStorage.removeItem(cartStorageKey);
  } catch { /* The cart remains usable when browser storage is unavailable. */ }
  if (cart) {
    state.coupon = cart.discountCodes.map(code => code.code).join(', ');
    commerce.couponMessage = cart.discountCodes.map(code => `${code.code}: ${code.applicable ? 'applied' : 'not applicable to this cart'}`).join('. ');
  }
}

async function initCommerce(force = false) {
  if (!force && !['home', 'shop', 'cart', 'checkout'].includes(currentRoute())) return;
  if (commerce.busy) return;
  commerce.busy = true;
  commerce.loading = true;
  commerce.error = '';
  // Initial markup already shows loading; keep its images and animations mounted.
  try {
    let id;
    try { id = localStorage.getItem(cartStorageKey); } catch { id = null; }
    id = id || commerce.cart?.id;
    const [products, savedCart] = await Promise.all([
      commerce.client.products(),
      id ? commerce.client.cart(id) : Promise.resolve(null)
    ]);
    for (const [flavour, product] of Object.entries(products)) {
      const previous = commerce.products[flavour]?.selectedVariantId;
      product.selectedVariantId = product.variants.nodes.find(variant => variant.id === previous)?.id || product.variants.nodes.find(variant => variant.availableForSale)?.id || product.variants.nodes[0]?.id;
      // Preserve the supplied square gallery artwork for both flavours.
    }
    commerce.products = products;
    state.productImage = 0;
    if (id) acceptCart(savedCart);
    commerce.cartReady = true;
  } catch (error) {
    commerce.error = error.message;
    console.warn('Shopify:', error.message);
  } finally {
    commerce.loading = false;
    commerce.busy = false;
    refreshCommerceView();
  }
}

async function cartOperation(operation, after, pendingPurchase = null) {
  if (commerce.busy || commerce.loading || !commerce.cartReady) return;
  commerce.busy = true;
  commerce.pendingPurchase = pendingPurchase;
  commerce.error = '';
  try {
    const result = await operation();
    acceptCart(result.cart);
    if (result.warnings.length) showToast(result.warnings.map(warning => warning.message).join(' '));
    commerce.busy = false;
    // Patch the visible line items in place instead of rebuilding the shell, so the cart
    // page and drawer do not flash on every quantity change.
    refreshCommerceView();
    if (after && !result.warnings.length) await after();
  } catch (error) {
    commerce.error = error.message;
    console.warn('Shopify:', error.message);
    showToast('Could not update your cart. Please retry.');
  } finally { commerce.busy = false; commerce.pendingPurchase = null; if (commerce.error) render(); }
}

function cartLineMarkup(line) {
  const variant = line.merchandise;
  return `<article class="cart-item" data-line-id="${escapeHtml(line.id)}"><div class="cart-image">${variant.image ? image(variant.image.url, variant.image.altText || variant.product.title) : ''}</div><div class="cart-item-body"><div class="cart-item-head"><h2>${escapeHtml(variant.product.title)}</h2><button class="cart-item-remove" type="button" data-action="line-remove" data-line-id="${escapeHtml(line.id)}" aria-label="Remove ${escapeHtml(variant.product.title)}" ${commerce.busy ? 'disabled' : ''}>${icon('trash')}</button></div><p class="cart-item-price"><strong class="item-price">${formatMoney(variant.price)}</strong></p><p class="line-total">Total: ${formatMoney(line.cost.totalAmount)}</p><div class="cart-item-controls"><button class="quantity-button" type="button" data-action="line-down" data-line-id="${escapeHtml(line.id)}" aria-label="Decrease quantity" ${commerce.busy || line.quantity <= 1 ? 'disabled' : ''}>\u2212</button><span class="quantity-value">${line.quantity}</span><button class="quantity-button" type="button" data-action="line-up" data-line-id="${escapeHtml(line.id)}" aria-label="Increase quantity" ${commerce.busy ? 'disabled' : ''}>+</button></div></div></article>`;
}

function appliedCoupons() {
  const codes = commerce.cart?.discountCodes || [];
  if (!codes.length) return '';
  return codes.map(code => `<div class="applied-coupon"><span class="coupon-party" aria-hidden="true">\u{1F389}\u{1F38A}</span><span class="applied-coupon-code">${escapeHtml(code.code)}</span><span class="applied-coupon-state">${code.applicable ? 'Applied' : 'Not applicable'}</span><button type="button" class="applied-coupon-remove" data-action="remove-coupon" data-code="${escapeHtml(code.code)}" aria-label="Remove coupon ${escapeHtml(code.code)}" ${commerce.busy ? 'disabled' : ''}>Remove</button></div>`).join('');
}

function deliveryPincodeCard() {
  const { pincode, status, message } = state.delivery;
  const saved = Boolean(pincode);
  const result = status === 'ready'
    ? `<p class="delivery-result is-ready" role="status">${escapeHtml(message)}</p>`
    : status === 'error' || status === 'unavailable'
      ? `<p class="delivery-result is-error" role="alert">${escapeHtml(message)}</p>`
      : saved ? `<p class="delivery-result" role="status">${escapeHtml(message || 'Pincode saved.')}</p>` : '';
  return `<section class="summary-card"><h3 class="summary-card-title">Enter delivery pincode</h3>${saved ? `<div class="pincode-saved"><span class="pincode-value">${escapeHtml(pincode)}</span>${result}<button type="button" class="text-button pincode-change" data-action="change-pincode">Change pincode</button></div>` : `<div class="inline-action-row"><input id="summary-pincode" name="summary-pincode" inputmode="numeric" autocomplete="postal-code" maxlength="6" placeholder="Enter pincode here" aria-label="Delivery pincode" /><button type="button" class="button" data-action="check-pincode">Check</button></div><p class="summary-card-note">Enter your pincode to check delivery availability.</p>`}</section>`;
}

function cartSummaryMarkup() {
  const cost = commerce.cart.cost;
  const currency = cost.subtotalAmount.currencyCode;
  // Shopify reports the discount as a negative amount on the total; surface it as savings.
  const subtotal = Number(cost.subtotalAmount.amount);
  const total = Number(cost.totalAmount.amount);
  const savings = Math.max(0, subtotal - total);
  const count = commerce.cart.lines.nodes.reduce((sum, line) => sum + line.quantity, 0);
  const money = amount => formatMoney({ amount: Number(amount).toFixed(2), currencyCode: currency });
  return `<section class="summary-card"><h3 class="summary-card-title">Coupons and offers</h3><p class="summary-card-note">Save more with coupon and offers</p><div class="cart-coupon">${couponEntry()}</div>${appliedCoupons()}</section>${deliveryPincodeCard()}<section class="summary-card"><h3 class="summary-card-title">Price Summary</h3><div class="summary-row"><span>Subtotal (${count} item${count === 1 ? '' : 's'})</span><span>${money(subtotal)}</span></div><div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>${savings > 0 ? `<div class="summary-row summary-row-savings"><span>Total savings</span><span>(\u2212) ${money(savings)}</span></div>` : ''}<div class="summary-row summary-row-total"><strong>Grand total</strong><strong>${formatMoney(cost.totalAmount)}</strong></div><p class="summary-tax-note">Inclusive of all taxes</p>${savings > 0 ? `<p class="summary-savings-banner">\u{1F389}\u{1F38A} You saved ${money(savings)} on this order</p>` : ''}</section><section class="summary-card summary-payments-card"><div class="payment-logos" aria-label="Accepted payment methods"><span class="payment-logo"><img src="assets/payment-logos/upi.png.png" alt="UPI" /></span><span class="payment-logo"><img src="assets/payment-logos/google-pay.png.png" alt="Google Pay" /></span><span class="payment-logo"><img src="assets/payment-logos/phonepe.png.png" alt="PhonePe" /></span><span class="payment-logo"><img src="assets/payment-logos/mastercard.png.png" alt="Mastercard" /></span><span class="payment-logo"><img src="assets/payment-logos/rupay.png.png" alt="RuPay" /></span><span class="payment-logo"><img src="assets/payment-logos/bhim.png.png" alt="BHIM" /></span></div><p class="summary-payments-note"><span class="secure-shield" aria-hidden="true">\u2713</span> UPI \u2022 Cards \u2022 Net Banking \u2022 Wallets \u2014 Secure payments powered by Razorpay.</p></section>`;
}

function cartSummaryCard() {
  return `<h2>Order summary</h2>${cartSummaryMarkup()}<p><button class="button primary" type="button" data-action="checkout" ${commerce.busy ? 'disabled' : ''}>Secure checkout</button></p><p class="small">Final shipping and taxes are confirmed at checkout.</p>`;
}

// Returns false when the visible cart cannot be patched (wrong view or missing hosts),
// letting the caller fall back to a full render.
function patchCartLines() {
  // The product page's own quantity controls read from the cart line, not .cart-layout,
  // so patch them too or the number never moves while a cart line exists.
  patchProductQuantityControls();
  const hosts = [...document.querySelectorAll('.cart-layout > section')];
  const lines = commerce.cart?.lines.nodes || [];
  // An emptied cart switches to the empty state, which cannot be patched line by line.
  if (!lines.length) {
    if (hosts.length) render();
    return true;
  }
  if (!hosts.length) return false;
  const html = lines.map(cartLineMarkup).join('');
  const summaries = [...document.querySelectorAll('.summary')];
  if (hosts.length !== summaries.length) return false;
  // Replacing the innerHTML of the existing hosts keeps the page shell, scroll position
  // and focus intact, so adding or removing a line no longer flashes the whole cart.
  hosts.forEach(host => { host.innerHTML = html; });
  summaries.forEach(summary => summary.innerHTML = cartSummaryCard());
  if (cartDrawerState.open) setCartDrawer(true, false);
  return true;
}

function patchProductQuantityControls() {
  const line = productCartLine();
  if (!line?.quantity) return;
  document.querySelectorAll('.product-actions .aura-quantity.pack-row, .floating-qty-group').forEach(control => {
    const output = control.querySelector('output');
    if (output) output.textContent = String(line.quantity);
    const left = control.querySelector('[data-action="box-down"], [data-action="open-remove"]');
    if (!left) return;
    // Swap between the decrement button and the trash button at quantity 1.
    const replacement = qtyLeftButton(line.quantity);
    if (left.dataset.action !== (line.quantity > 1 ? 'box-down' : 'open-remove')) {
      const holder = document.createElement('div');
      holder.innerHTML = replacement;
      left.replaceWith(holder.firstElementChild);
    }
    const plus = control.querySelector('[data-action="box-up"]');
    if (plus) plus.disabled = commerce.busy;
  });
}

async function addShopifyProduct(flavour, quantity, buyNow = false) {
  const variant = selectedVariant(flavour);
  if (!variant?.availableForSale || !Number.isInteger(quantity) || quantity < 1) return;
  await cartOperation(() => {
    const lines = [{ merchandiseId: variant.id, quantity }];
    return commerce.cart ? commerce.client.add(commerce.cart.id, lines) : commerce.client.create(lines, state.coupon ? [state.coupon] : []);
  }, () => { if (buyNow) return openShopifyCheckout(); showToast('Product added to bag'); }, { action: buyNow ? 'buy' : 'add', flavour });
}

async function changeCartLine(action, id) {
  const line = commerce.cart?.lines.nodes.find(item => item.id === id);
  if (!line) return;
  const quantity = line.quantity + (action === 'line-up' ? 1 : -1);
  if (action !== 'line-remove' && quantity < 1) return;
  await cartOperation(() => action === 'line-remove'
    ? commerce.client.remove(commerce.cart.id, [id])
    : commerce.client.update(commerce.cart.id, [{ id, quantity }]), () => {
      if (action === 'line-remove') return;
      const updated = commerce.cart.lines.nodes.find(item => item.id === id);
      if (!updated || updated.quantity === line.quantity) return;
      if (action === 'line-up') state.auraDownStreak = 0;
      else state.auraDownStreak += 1;
      showToast(action === 'line-up' ? `+${updated.quantity * 1000} AURA` : `\u2212${state.auraDownStreak * 1000} AURA`);
    });
}

async function applyShopifyCoupon(code) {
  if (commerce.busy || code.length > 100) return;
  if (!commerce.cart) {
    state.coupon = code;
    commerce.couponMessage = code ? 'Code saved; Shopify will validate it when you add an item.' : 'Coupon cleared.';
    render();
    return;
  }
  await cartOperation(() => commerce.client.discount(commerce.cart.id, code ? [code] : []));
}

async function openShopifyCheckout() {
  if (commerce.busy || !commerce.cart?.totalQuantity) return;
  commerce.busy = true;
  commerce.error = '';
  render();
  try {
    const cart = await commerce.client.cart(commerce.cart.id);
    acceptCart(cart);
    if (!cart?.totalQuantity) { navigate('cart'); return; }
    const url = new URL(cart.checkoutUrl);
    if (url.protocol !== 'https:') throw new Error('Shopify returned an invalid checkout URL.');
    window.location.assign(url.href);
  } catch (error) {
    commerce.error = error.message;
    console.warn('Shopify:', error.message);
    showToast('Checkout could not be opened. Please retry.');
  } finally { commerce.busy = false; render(); }
}

function brand() {
  return routeLink('home', '<img class="brand-logo" src="assets/optimized/site/aura-whey-logo.webp" alt="Aura Whey \u2014 Fuel your aura" width="1254" height="1254" decoding="async">', 'brand');
}

function shell(content) {
  const current = currentRoute();
  const trailingSections = current === 'shop' ? '' : `${shopInvitation()}${storeFaq()}`;
  const shellTheme = current === 'shop' ? productFlavours[state.flavour].theme : '';
  const nav = links.map(([route, text]) => routeLink(route, text, `nav-link ${route === current ? 'active' : ''}`)).join('');
  const themeLabel = state.theme === 'dark' ? 'Use light mode' : 'Use dark mode';
  const themeIcon = state.theme === 'dark' ? 'sun' : 'moon';
  const accountLabel = customerAccount.authenticated ? `Account for ${customerAccount.customer?.displayName || 'customer'}` : 'Sign in or log in';
  const mobileAccountLabel = customerAccount.authenticated ? 'Your account' : 'Sign in / Log in';
  const root = document.querySelector('#app');
  if (!root) return;
  root.innerHTML = `
    <div class="shell ${shellTheme} ${current === 'shop' ? 'product-route' : ''}">
      <header class="site-header">
        <div class="coupon-wrap" role="region" aria-label="Special Offers">
          <div class="coupon-ticker-track" data-action="apply-coupon" title="Click to copy & apply code DISC5 (5% OFF)">
            <div class="coupon-ticker-content">
              <span class="ticker-item"><span class="ticker-pill">OFFER</span> Use Coupon Code <strong class="ticker-code">"DISC5"</strong> to get 5% off on all orders</span>
              <span class="ticker-dot">\u2022</span>
              <span class="ticker-item">\u{1F69A} FREE EXPRESS DELIVERY ACROSS INDIA OVER \u20b9999</span>
              <span class="ticker-dot">\u2022</span>
              <span class="ticker-item">\u26A1 100% GENUINE & NABL LAB TESTED</span>
              <span class="ticker-dot">\u2022</span>
              <span class="ticker-item">CASH ON DELIVERY (COD) AVAILABLE</span>
              <span class="ticker-dot">\u2022</span>
              <span class="ticker-item"><span class="ticker-pill">OFFER</span> Use Coupon Code <strong class="ticker-code">"DISC5"</strong> to get 5% off on all orders</span>
              <span class="ticker-dot">\u2022</span>
              <span class="ticker-item">\u{1F69A} FREE EXPRESS DELIVERY ACROSS INDIA OVER \u20b9999</span>
              <span class="ticker-dot">\u2022</span>
              <span class="ticker-item">\u26A1 100% GENUINE & NABL LAB TESTED</span>
              <span class="ticker-dot">\u2022</span>
              <span class="ticker-item">CASH ON DELIVERY (COD) AVAILABLE</span>
              <span class="ticker-dot">\u2022</span>
            </div>
          </div>
        </div>
        <div class="header">
          <div class="header-inner">
            ${brand()}
            <nav class="desktop-nav" aria-label="Primary navigation">${nav}</nav>
            <div class="header-actions">
              <button type="button" class="icon-button" data-action="open-search" aria-label="Search products" aria-haspopup="dialog">${icon('search')}</button>
              ${iconLink('account', 'account', accountLabel, customerAccount.authenticated ? 'is-authenticated' : '')}
              <button type="button" class="icon-button cart-link" data-action="open-cart" aria-label="${state.cart} items in cart, open cart" aria-haspopup="dialog">${icon('bag')}<span class="cart-count" aria-label="${state.cart} items in cart">${state.cart}</span><span class="sr-only">Cart</span></button>
              <button class="icon-button theme-toggle" type="button" data-action="toggle-theme" aria-label="${themeLabel}" title="${themeLabel}">${icon(themeIcon)}</button>
              <button class="icon-button menu-button" type="button" data-action="open-menu" aria-label="Open menu" aria-expanded="false">${icon('menu')}</button>
            </div>
          </div>
        </div>
      </header>
      <div class="overlay" data-action="close-menu"></div>
      <aside class="cart-drawer" id="cart-drawer" aria-label="Your cart" aria-hidden="true" inert>
        <div class="cart-drawer-head"><h2>Your cart</h2><button type="button" class="icon-button" data-action="close-cart" aria-label="Close cart">${icon('close')}</button></div>
        <div class="cart-drawer-body">${cart()}</div>
      </aside>
      <aside class="mobile-panel" id="mobile-menu" aria-label="Mobile navigation" aria-hidden="true" inert>
        <div class="mobile-panel-top">${brand()}<div class="mobile-panel-actions"><button type="button" class="icon-button cart-link mobile-cart-link" data-action="open-cart" aria-label="${state.cart} items in cart, open cart">${icon('bag')}<span class="cart-count" aria-label="${state.cart} items in cart">${state.cart}</span><span class="sr-only">Cart</span></button><button class="icon-button menu-close" type="button" data-action="close-menu" aria-label="Close menu">${icon('close')}</button></div></div>
        <button type="button" class="mobile-search-trigger" data-action="open-search">${icon('search')} Search products</button>
        <nav>${nav}${routeLink('account', mobileAccountLabel)}</nav>
        <div class="mobile-theme"><span>Appearance</span><button type="button" class="text-button" data-action="toggle-theme">${state.theme === 'dark' ? 'Light mode' : 'Dark mode'}</button></div>
      </aside>
      <main tabindex="-1">${content}${trailingSections}</main>
      <footer class="footer">
        <div class="footer-grid">
          <div class="footer-intro">${brand()}<p>Whey protein in Mawa Kulfi and Rich Chocolate flavours. Built around the routine, not the noise.</p></div>
          <div class="footer-column"><strong>Shop</strong><ul><li>${routeLink('shop', 'Whey protein')}</li><li>${routeLink('cart', 'Your cart')}</li></ul></div>
          <div class="footer-column"><strong>Quick links</strong><ul><li>${routeLink('policy', 'Shipping & delivery')}</li><li>${routeLink('policy', 'Returns & replacement')}</li><li>${routeLink('quality', 'Quality & lab reports')}</li><li>${routeLink('blog', 'Journal')}</li></ul></div>
          <div class="footer-column footer-contact"><strong>Contact us</strong><p>Questions about your order or your routine?</p>${routeLink('contact', 'Get in touch', 'footer-contact-link')}<p>We\u2019ll get back to you as soon as possible.</p></div>
        </div>
        <div class="footer-socials footer-socials-after" aria-label="Social links"><a href="#" aria-label="Facebook">${icon('facebook')}</a><a href="#" aria-label="Instagram">${icon('instagram')}</a><a href="#" aria-label="LinkedIn">${icon('linkedin')}</a><a href="#" aria-label="YouTube">${icon('youtube')}</a></div>
        <p class="footer-tagline">Fuel your aura. Build a routine you love.</p>
        <div class="footer-bottom"><span>© 2026 Aura Whey, made with \u{1F49B} by Dinesh and Kanishk</span></div>
      </footer>
      ${searchDialog()}
    </div>`;
}

function heroBannerCarousel() {
  const currentSlide = heroSlides[state.heroSlide] || heroSlides[0];
  return `
    <div class="hero-section-wrap">
      <div class="hero-ambient-bg" id="hero-ambient-bg" style="background-image: url('${currentSlide.ambientImage}');"></div>
      <div class="hero-ambient-vignette"></div>
      <section class="hero-carousel" id="hero-carousel" aria-label="Featured Promotions" role="region">
        <div class="hero-slides-track">
          ${heroSlides.map((slide, index) => {
            const isActive = index === state.heroSlide;
            return `
              <div class="hero-slide ${isActive ? 'is-active' : ''}" data-slide-index="${index}" role="group" aria-roledescription="slide" aria-label="${slide.title}" aria-hidden="${!isActive}">
                <a href="${slide.link || '/shop'}" class="hero-slide-link" tabindex="${isActive ? '0' : '-1'}">
                  <picture class="hero-picture">
                    ${slide.mobileImage ? `<source media="(max-width: 768px)" ${isActive ? 'srcset' : 'data-srcset'}="${slide.mobileImage}">` : ''}
                    <img class="hero-banner-img" ${isActive ? 'src' : 'data-src'}="${slide.desktopImage}" alt="${slide.alt || slide.title}" width="1920" height="730" decoding="async" fetchpriority="${isActive ? 'high' : 'low'}" loading="${isActive ? 'eager' : 'lazy'}" />
                  </picture>
                </a>
              </div>`;
          }).join('')}
        </div>
        <button type="button" class="hero-ctrl-btn prev" data-action="hero-prev" aria-label="Previous slide">
          ${icon('arrowLeft')}
        </button>
        <button type="button" class="hero-ctrl-btn next" data-action="hero-next" aria-label="Next slide">
          ${icon('arrowRight')}
        </button>
        <div class="hero-indicators" role="tablist" aria-label="Hero slide navigation">
          ${heroSlides.map((slide, index) => {
            const isActive = index === state.heroSlide;
            return `<button type="button" class="hero-indicator ${isActive ? 'is-active' : ''}" data-action="hero-${index}" role="tab" aria-selected="${isActive}" aria-label="Go to slide ${index + 1}: ${slide.title}"></button>`;
          }).join('')}
        </div>
      </section>
    </div>`;
}

function home() {
  return `
    ${heroBannerCarousel()}
    <section class="section"><div class="section-inner"><div class="section-head"><div><h2>Pick your flavour</h2><div class="gold-rule"></div></div><p>Choose the flavour that fits the ritual you want to repeat.</p></div><div class="grid product-grid">${productCard('Mawa Kulfi')}${productCard('Rich Chocolate')}</div></div></section>
    ${reviewShowcase('home', reviewData.home || approvedReviews)}
    <section class="section"><div class="section-inner"><div class="section-head"><div><h2>Made for the routine</h2><div class="gold-rule"></div></div><p>Simple product details. Familiar flavours. A dependable post-training choice.</p></div><div class="image-section">${routeLink('shop', image(assets.why, 'Aura Whey athlete campaign with Mawa Kulfi and Rich Chocolate'), 'routine-banner-link')}</div><p class="button-row">${routeLink('shop', 'Shop now', 'button-link primary')}${routeLink('article/plan-your-protein-routine', 'Build your routine', 'button-link secondary')}</p></div></section>
    <section class="section"><div class="section-inner"><div class="section-head"><div><h2>Know your pack</h2><div class="gold-rule"></div></div><p>Read the nutrition panel, check the documents, then find your batch report.</p></div><div class="grid grid-2"><div class="card label-card">${image(assets.labelMawa, 'Aura Whey Mawa Kulfi nutrition label', 'label-preview')}</div><div class="quality-cta"><h3>Quality documents and batch reports</h3><p>Our quality library keeps the supplied certification documents in one place. Check whether a third-party laboratory report is available for your batch.</p><div class="button-row">${routeLink('quality', 'Open quality library', 'button-link primary')}${routeLink('verify', 'Verify a batch', 'button-link')}</div></div></div></div></section>
    <section class="section"><div class="section-inner"><div class="section-head"><div><h2>Better-informed training</h2><div class="gold-rule"></div></div><p>Practical guides for choosing, using, and enjoying your whey protein.</p></div><div class="grid grid-3">${blogCard(0)}${blogCard(1)}${blogCard(2)}</div><p>${routeLink('blog', 'Browse the journal', 'button-link secondary')}</p></div></section>
    ${nutritionTrust()}`;
}

const posts = [
  {
    slug: 'choose-your-flavour',
    title: 'How to choose a whey protein flavour',
    excerpt: 'Creamy and familiar or deep and chocolatey? Find a flavour that fits your everyday shake.',
    image: './assets/optimized/site/BLOG/BLOG-1.webp',
    alt: 'Kulfi-inspired and chocolate shakes on a warm stone counter',
    sections: [
      ['Start with what you enjoy', 'Think about the flavours you already reach for. If traditional Indian desserts are your thing, Mawa Kulfi brings a creamy, dessert-inspired character. If you usually choose chocolate, Rich Chocolate offers a familiar cocoa profile. Your everyday shake should be something you look forward to.'],
      ['Keep the first shake simple', 'Prepare your first serving according to the pack directions before adding fruit, coffee or other extras. That gives you a clear sense of the flavour on its own. Use the same preparation when comparing flavours, so you can decide which one you prefer.'],
      ['Read beyond the flavour name', 'Taste is only one part of the choice. Check the ingredient list, allergen information, serving size and storage directions on the actual pack. Flavour photography is inspiration for serving, so use the label to understand what is inside. Pick the option that suits both your preferences and your routine.']
    ]
  },
  {
    slug: 'plan-your-protein-routine',
    title: 'A simple way to plan your protein routine',
    excerpt: 'A ready shaker, a familiar time and less daily guesswork. Make your routine easier to repeat.',
    image: './assets/optimized/site/BLOG/BLOG-2.webp',
    alt: 'Black and gold shaker beside a towel, scoop and training notebook',
    sections: [
      ['Choose a moment that fits', 'Start with your real schedule. Decide when preparing a shake is convenient, whether that is at home before heading out or after returning from training. Choose a moment you can repeat without rushing. The aim is to make preparation easy to remember.'],
      ['Get the basics ready', 'Keep your shaker clean, dry and easy to find. Read the mixing directions and serving size on your pack before preparing it, and follow the storage instructions between uses. A little preparation means fewer things to organise when your day gets busy.'],
      ['Keep it practical', 'Use a simple note to record what you enjoyed and what felt inconvenient: the flavour, your preparation or the time you chose. Adjust one thing at a time. Keep regular meals in your plan and treat the shake as an addition to your day. Build a routine around what you can comfortably maintain.']
    ]
  },
  {
    slug: 'mawa-kulfi-or-rich-chocolate',
    title: 'Mawa Kulfi or Rich Chocolate?',
    excerpt: 'Discover the creamy kulfi-inspired character and classic cocoa flavour behind our two favourites.',
    image: './assets/optimized/site/BLOG/BLOG-3.webp',
    alt: 'Aura Whey Mawa Kulfi and Rich Chocolate tubs side by side',
    sections: [
      ['Mawa Kulfi: a familiar twist', 'Mawa Kulfi takes its flavour inspiration from a much-loved Indian dessert. Its creamy character makes it a choice to consider if you want something different from the usual chocolate shake. Think of it as a little familiarity in your everyday routine, with the convenience of whey protein.'],
      ['Rich Chocolate: the classic choice', 'Rich Chocolate is for anyone who naturally reaches for cocoa flavours. It keeps the choice straightforward: a chocolate-led shake with a familiar flavour profile. If chocolate is already your first pick when choosing a drink or dessert, this is a natural place to start.'],
      ['Let your preference decide', 'Neither flavour needs to win for everyone. Choose the one you would most enjoy preparing again tomorrow. Check each pack for its own ingredients, nutrition and allergen details rather than assuming the flavours are identical. Follow the mixing directions for your first serving, then decide which belongs in your routine.']
    ]
  }
];
function blogCard(index) {
  const post = posts[index % posts.length];
  return `<article class="card blog-card"><div class="blog-image">${image(post.image, post.alt)}</div><div class="blog-card-copy"><h3>${post.title}</h3><p>${post.excerpt}</p>${routeLink(`article/${post.slug}`, 'Read guide', 'text-link')}</div></article>`;
}

function productCard(flavour) {
  const isMawa = flavour === 'Mawa Kulfi';
  const description = isMawa ? 'A creamy, kulfi-inspired finish with a familiar Indian flavour profile.' : 'A deep chocolate flavour made for a classic shake routine.';
  return `<article class="card product-card ${productFlavours[flavour].theme}">
    <button type="button" class="product-card-media" data-action="select-${flavour}" aria-label="View Aura Whey ${flavour}">${image(productFlavours[flavour].images[0], `Aura Whey ${flavour}`)}</button>
    <div class="product-card-body">
      <div class="product-card-top"><h3>${liveTitle(flavour)}</h3><strong>${livePrice(flavour)}</strong></div>
      <div class="product-meta"><span>1 kg</span><span>28 servings</span></div>
      <p>${escapeHtml(commerce.products[flavour]?.description || description)}</p>
      <div class="product-card-macros"><span><b>24g</b> Protein</span><span><b>5.7g</b> BCAAs</span><span><b>28</b> Servings</span></div>
      <div class="button-row">${purchaseButton(`add-flavour-${flavour}`, 'Add to cart', 'primary', 'bag', flavour)}${button(`select-${flavour}`, 'View product', 'secondary')}</div>
    </div>
  </article>`;
}

function couponEntry() {
  const result = commerce.couponMessage || (state.coupon ? 'Code saved; Shopify will validate it when you add an item.' : 'Have a code? Apply it before checkout.');
  return `<form class="coupon-form" data-form="coupon"><label class="field" for="coupon-code">Coupon code</label><div class="inline-action-row"><input id="coupon-code" name="coupon" maxlength="100" value="${escapeHtml(state.coupon)}" placeholder="Enter coupon code" /><button type="submit" class="button" ${commerce.busy ? 'disabled' : ''}>Apply</button></div></form><div class="coupon-result" aria-live="polite">${escapeHtml(result)}</div>`;
}

function productInside() {
  return `<div class="product-inside">
    <div class="purchase-notes">${routeLink('policy', 'Shipping & delivery')}${routeLink('policy', 'Returns & replacement policy')}</div>
    <p class="inside-intro">Your everyday whey, with a flavour worth coming back for. Get to know your ${state.flavour} serving.</p>
    <h3>What's inside?</h3>
    <div class="inside-serving"><span class="serving-number">24<span>g</span></span><div><strong>Protein in every serving</strong><span>35 g serving · ${state.flavour}</span></div></div>
    <dl class="inside-breakdown"><div><dt>Protein</dt><dd>24 g</dd></div><div><dt>BCAAs</dt><dd>5.7 g</dd></div><div><dt>Serving size</dt><dd>35 g</dd></div><div><dt>Servings per 1 kg pack</dt><dd>28</dd></div></dl>
    <p class="inside-caption">Per serving. BCAAs are part of the protein content.</p>
    <details class="inside-detail"><summary>Nutritional facts<span aria-hidden="true">+</span></summary><div><p>Each 35 g serving provides 24 g protein, including 5.7 g BCAAs. For the full nutrition panel, refer to your flavour's pack label.</p>${state.flavour === 'Mawa Kulfi' ? image(assets.labelMawa, 'Mawa Kulfi full nutrition and ingredient label', 'inside-label') : '<p>Check the Rich Chocolate pack for its complete nutrition and ingredient information.</p>'}</div></details>
    <details class="inside-detail"><summary>Product details<span aria-hidden="true">+</span></summary><div><dl class="inside-breakdown"><div><dt>Flavour</dt><dd>${state.flavour}</dd></div><div><dt>Net weight</dt><dd>1 kg</dd></div><div><dt>Product</dt><dd>Whey protein</dd></div></dl><p>Refer to the pack for ingredients, allergen advice, mixing directions, storage instructions and the best-before date.</p></div></details>
    <p class="inside-footnote">Know your pack. Read the label. Find your routine.</p>
  </div>`;
}

function deliveryOptions() {
  const result = state.delivery.status === 'error'
    ? `<p class="delivery-result is-error" id="delivery-result" role="alert">${escapeHtml(state.delivery.message)}</p>`
    : state.delivery.status === 'ready'
      ? `<p class="delivery-result is-ready" id="delivery-result" role="status">${escapeHtml(state.delivery.message)}</p>`
      : `<p class="delivery-result" id="delivery-result" role="status">${escapeHtml(state.delivery.message || 'Enter your pincode to check delivery availability.')}</p>`;
  return `<section class="delivery-options" aria-labelledby="delivery-options-title"><h3 id="delivery-options-title">${icon('mapPin')} Delivery options</h3><form class="delivery-check-form" data-form="delivery-check"><label class="sr-only" for="delivery-pincode">Delivery pincode</label><div class="inline-action-row"><input id="delivery-pincode" name="pincode" inputmode="numeric" autocomplete="postal-code" maxlength="6" pattern="[0-9]{6}" value="${escapeHtml(state.delivery.pincode)}" placeholder="Enter pincode" required /><button type="submit" class="button" ${commerce.busy ? 'disabled' : ''}>Check</button></div></form>${result}<ul class="delivery-promises"><li>${icon('truck')}<span>Free shipping on orders above \u20b92,000</span></li><li>${icon('refresh')}<a href="/policy" data-route="policy">Replacement and cancellation policy</a></li></ul></section>`;
}

function nutritionTrust() {
  return `<section class="section nutrition-trust"><div class="section-inner">
    <div class="section-head"><div><h2>Know what goes into your routine.</h2><div class="gold-rule"></div></div><p>Nutrition at a glance. Quality information within reach.</p></div>
    <div class="nutrition-trust-stats"><div><strong>24<span>g</span></strong><p>Protein per serving</p></div><div><strong>5.7<span>g</span></strong><p>BCAAs per serving</p></div><div><strong>35<span>g</span></strong><p>Serving size</p></div><div><strong>28</strong><p>Servings per pack</p></div></div>
    <div class="certification-heading"><h3>Food safety & manufacturing</h3><p>Explore the certification categories in our quality library.</p></div>
    <div class="certification-strip">${[['FSSAI', 'Food safety licence'], ['ISO 22000', 'Food safety management'], ['GMP', 'Manufacturing practices'], ['HACCP', 'Hazard control']].map(([name, description]) => `<a class="certification-item" href="/quality"><span class="certification-symbol" aria-hidden="true">${icon('file')}</span><strong>${name}</strong><span>${description}</span></a>`).join('')}</div>
    <div class="nutrition-trust-bottom"><p>Read the pack label for full nutrition and ingredient details.</p>${routeLink('quality', 'Explore quality information', 'text-link')}</div>
  </div></section>`;
}

function shopInvitation() {
  return `<section class="section shop-invitation"><div class="section-inner"><div><h2>Find your everyday flavour.</h2><p>Mawa Kulfi or Rich Chocolate. Make it your routine.</p></div><div class="button-row">${routeLink('shop', 'Shop now', 'button-link primary')}${routeLink('article/mawa-kulfi-or-rich-chocolate', 'Compare flavours', 'button-link secondary')}</div></div></section>`;
}

const approvedReviews = Object.freeze([]);
let reviewData = { home: null, product: null };

function reviewCard(review) {
  const rating = Math.max(1, Math.min(5, Number(review.rating) || 1));
  const name = String(review.displayName || review.name || 'Aura Whey customer').trim();
  const initials = name.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase() || 'AW';
  const badge = review.verified ? 'Verified purchase' : 'Customer review';
  return `<article class="review-card"><div class="review-card-top"><span class="review-avatar" aria-hidden="true">${escapeHtml(initials)}</span><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(review.productName || review.flavour || state.flavour)}</span></div></div><div class="review-stars" aria-label="${rating} out of 5 stars">${'\u2605'.repeat(rating)}<span aria-hidden="true">${'\u2606'.repeat(5 - rating)}</span></div><p class="review-copy">\u201c${escapeHtml(review.reviewText || review.text || '')}\u201d</p><span class="review-badge">${escapeHtml(badge)}</span></article>`;
}

function approvedReviewCards(reviews = approvedReviews, scope = 'product') {
  const visible = reviews.filter(review => review && review.approved !== false && (scope === 'home' || review.shopifyProductHandle === SHOPIFY_CONFIG.products[state.flavour]));
  if (!visible.length) {
    const subject = scope === 'home' ? 'Mawa Kulfi and Rich Chocolate' : state.flavour;
    return `<div class="review-empty"><span aria-hidden="true">\u2606</span><div><h3>Community stories are warming up.</h3><p>Approved customer reviews for ${escapeHtml(subject)} will appear here.</p></div></div>`;
  }
  const className = scope === 'product' ? 'review-card-track' : 'review-card-grid';
  const label = scope === 'product' ? `Customer reviews for ${state.flavour}` : 'Customer reviews for all Aura Whey flavours';
  return `<div class="${className}" aria-label="${escapeHtml(label)}">${visible.map(reviewCard).join('')}</div>`;
}

function reviewShowcase(scope = 'home', reviews = approvedReviews) {
  const isProduct = scope === 'product';
  const titleId = isProduct ? 'product-customer-reviews-title' : 'home-customer-reviews-title';
  const hasVisibleReviews = reviews.some(review => review?.approved === true && (!isProduct || !review.flavour || review.flavour === state.flavour));
  const controls = isProduct && hasVisibleReviews ? `<div class="review-carousel-controls" aria-label="Review carousel controls"><button type="button" class="button" data-action="reviews-prev" aria-label="Previous review">${icon('arrowLeft')}</button><button type="button" class="button" data-action="reviews-next" aria-label="Next review">${icon('arrowRight')}</button></div>` : '';
  const supportingCopy = isProduct
    ? `What ${escapeHtml(state.flavour)} customers say \u2014 people who take their training seriously and still believe a great shake should make them smile.`
    : 'A collection of love for Mawa Kulfi and Rich Chocolate from people who take their fitness and wellbeing seriously.';
  return `<section class="section product-reviews review-showcase-${scope}" data-review-scope="${scope}" aria-labelledby="${titleId}"><div class="section-inner"><div class="review-heading-row"><header class="review-love-header"><p class="hero-overline">Love from the routine</p><h2 id="${titleId}">Strong routines. Big love.</h2><p>${supportingCopy}</p></header>${controls}</div><div class="review-board">${approvedReviewCards(reviews, scope)}${isProduct ? '<article id="review-preview" class="review-card review-preview" hidden></article>' : ''}</div></div></section>`;
}


function productReviews() {
  const labels = ['Poor', 'Fair', 'Good', 'Great', 'Superb'];
  const star = `<svg viewBox="0 0 24 24" width="36" height="36" focusable="false"><path fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round" d="M12 3 14.8 8.7 21 9.6 16.5 14 17.6 20.2 12 17.3 6.4 20.2 7.5 14 3 9.6 9.2 8.7Z"/></svg>`;
  const rating = `<fieldset class="review-rating peek-rating"><legend>Your rating</legend><div class="peek-rating-stars" role="radiogroup" aria-label="Your rating"><span class="peek-rating-tip" aria-live="polite">Good</span>${[1, 2, 3, 4, 5].map(n => `<label data-rating="${n}"><input class="peek-rating-input" type="radio" name="rating" value="${n}"${n === 3 ? ' checked' : ''} required /><span aria-hidden="true">${star}</span><span class="sr-only">${n} \u2014 ${labels[n - 1]}</span></label>`).join('')}</div></fieldset>`;
  return `${reviewShowcase('product', reviewData.product || approvedReviews)}<section class="section review-contribute-section"><div class="section-inner"><div class="review-contribute"><div class="review-layout"><div><p class="hero-overline">Your turn</p><h3>Share your Aura.</h3><p>How did it taste? How did it mix? Tell us what made it part of your routine.</p><p class="small">Your review is published immediately after a quick safety check.</p></div><form class="form" data-form="review"><label class="field">Your name<input name="reviewName" maxlength="60" required autocomplete="given-name" /></label><label class="field" aria-hidden="true" style="position:absolute;left:-9999px">Website<input name="website" tabindex="-1" autocomplete="off" /></label>${rating}<label class="field">Your review<textarea name="reviewText" rows="4" minlength="10" maxlength="1000" required placeholder="Tell us about the flavour and your experience"></textarea></label><button type="submit" class="button primary">Submit review</button><div id="review-result" role="status" aria-live="polite"></div></form></div></div></div></section>`;
}

function showSavedReview() {
  return undefined;
  const preview = document.querySelector('#review-preview');
  if (!preview) return;
  try {
    const review = null;
    if (!review || typeof review.name !== 'string' || typeof review.text !== 'string' || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) return;
    preview.replaceChildren();
    const stars = document.createElement('div');
    stars.className = 'review-stars';
    stars.setAttribute('aria-label', review.rating + ' out of 5 stars');
    stars.textContent = '\u2605'.repeat(review.rating) + '\u2606'.repeat(5 - review.rating);
    const body = document.createElement('p');
    body.className = 'review-copy';
    body.textContent = review.text;
    const footer = document.createElement('div');
    footer.className = 'review-preview-footer';
    const heading = document.createElement('strong');
    heading.textContent = review.name + ' · ' + state.flavour;
    const badge = document.createElement('span');
    badge.className = 'review-badge';
    badge.textContent = 'Private preview';
    footer.append(heading, badge);
    preview.append(stars, body, footer);
    preview.hidden = false;
  } catch { preview.hidden = true; }
}

async function loadReviews(scope = 'product') {
  const url = scope === 'home' ? '/api/reviews?scope=home' : '/api/reviews?product=' + encodeURIComponent(SHOPIFY_CONFIG.products[state.flavour]);
  const section = document.querySelector(`[data-review-scope="${scope}"]`);
  if (section) section.querySelector('.review-board').innerHTML = '<p class="review-loading" role="status">Loading reviews...</p>';
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Reviews are temporarily unavailable.');
    reviewData[scope] = result.reviews || [];
  } catch (error) {
    if (section) section.querySelector('.review-board').innerHTML = `<p class="review-error" role="alert">${escapeHtml(error.message)}</p>`;
    return;
  }
  if (section) section.querySelector('.review-board').innerHTML = approvedReviewCards(reviewData[scope], scope);
}

function loadReviewsForPage() {
  if (currentRoute() === 'shop') loadReviews('product');
  if (currentRoute() === 'home') loadReviews('home');
}

function storeFaq() {
  return `<section class="section store-faq"><div class="section-inner store-faq-layout"><header class="store-faq-heading"><h2>Got questions?</h2><p>Let\u2019s dive in.</p></header><div class="store-faq-list">${faqItems()}<p class="faq-sources">General guidance: <a href="https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance">NIDDK: lactose intolerance</a> and <a href="https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-Consumer/">NIH: exercise supplements</a>. Your pack label and individual medical advice take priority.</p></div><p class="store-faq-contact">${routeLink('contact', 'Still have a question? Get in touch', 'text-link')}</p></div></section>`;
}

function floatingPurchaseBar() {
  const productImage = productFlavours[state.flavour].images[0];
  return `<aside class="floating-purchase${purchaseBarState.visible ? ' is-visible' : ''}" id="floating-purchase" aria-label="Quick purchase" aria-hidden="${purchaseBarState.visible ? 'false' : 'true'}"><div class="floating-purchase-inner"><div class="floating-product-summary">${image(productImage, `Aura Whey ${state.flavour}`)}<div><strong>${liveTitle()}</strong><span>1 kg · 28 servings</span></div><b>${livePrice()}</b></div><div class="floating-purchase-actions">${floatingActions()}</div></div></aside>`;
}


function productCartLine() {
  const variantId = selectedVariant()?.id;
  return commerce.cart?.lines.nodes.find(line => line.merchandise?.id === variantId) || null;
}

function qtyLeftButton(quantity) {
  return quantity > 1
    ? `<button type="button" class="pack-btn" data-action="box-down" aria-label="Decrease quantity">\u2212</button>`
    : `<button type="button" class="pack-btn pack-trash" data-action="open-remove" aria-label="Remove item from cart">${icon('trash')}</button>`;
}

function packControls(line) {
  const plus = `<button type="button" class="pack-btn" data-action="box-up" aria-label="Increase quantity">+</button>`;
  return `<div class="aura-quantity pack-row" role="group" aria-label="Quantity">${qtyLeftButton(line.quantity)}<output class="aura-quantity-value" aria-live="polite">${line.quantity}</output>${plus}<div class="aura-bursts" aria-hidden="true"></div></div>`;
}

function productActions() {
  const line = productCartLine();
  if (line) return `${packControls(line)}<div class="button-row">${button('open-cart', 'Go to cart', 'primary go-to-cart')}</div>`;
  return `<div class="button-row">${purchaseButton('add-cart', 'Add to cart', 'floating-add', 'bag')}${purchaseButton('buy-now', 'Buy now', 'primary')}${routeLink('quality', 'View quality documents', 'button-link secondary')}</div>`;
}

function floatingActions() {
  const line = productCartLine();
  if (line) {
    return `<div class="floating-qty-group">${qtyLeftButton(line.quantity)}<output class="floating-qty" aria-live="polite">${line.quantity}</output><button type="button" class="pack-btn" data-action="box-up" aria-label="Increase quantity">+</button></div>${button('open-cart', 'Go to cart', 'primary floating-buy')}`;
  }
  return `${purchaseButton('add-cart', 'Add to cart', 'floating-add')}${purchaseButton('buy-now', 'Buy now', 'primary floating-buy')}`;
}

async function setCartLineQuantity(line, delta) {
  const quantity = line.quantity + delta;
  if (!commerce.cart || quantity < 1) return;
  await cartOperation(() => commerce.client.update(commerce.cart.id, [{ id: line.id, quantity }]));
}

async function removeCartLine(line) {
  if (!commerce.cart) return;
  await cartOperation(() => commerce.client.remove(commerce.cart.id, [line.id]));
  showToast('Product removed from bag');
}

function openRemoveModal(line) {
  document.querySelector('.remove-modal')?.remove();
  const overlay = document.createElement('div');
  overlay.className = 'remove-modal';
  overlay.innerHTML = `<div class="remove-modal-card" role="dialog" aria-modal="true" aria-label="Remove item"><div class="remove-modal-head"><strong>Remove item?</strong><button type="button" class="remove-modal-close" aria-label="Close">${icon('close')}</button></div><p>Are you sure you want to remove this item from your cart?</p><button type="button" class="button primary remove-go-back">Go back</button><button type="button" class="button remove-confirm">Remove item</button></div>`;
  const close = () => overlay.remove();
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  overlay.querySelector('.remove-modal-close').addEventListener('click', close);
  overlay.querySelector('.remove-go-back').addEventListener('click', close);
  overlay.querySelector('.remove-confirm').addEventListener('click', () => { close(); removeCartLine(line); });
  document.body.appendChild(overlay);
}

function shop() {
return `<div class="product-page ${productFlavours[state.flavour].theme}"><div class="commerce-status">${commerceStatus()}</div><h1 class="page-title">Aura Whey Protein</h1><div class="product-layout"><section class="product-gallery"><button type="button" class="product-main-image" data-image-viewer aria-label="Open ${state.flavour} image viewer">${image(productFlavours[state.flavour].images[state.productImage], `${state.flavour} Aura Whey product`, 'product-main-photo')}<span class="product-image-hint" aria-hidden="true">${icon('search')}</span></button><div class="thumbnail-row" aria-label="Product images">${productFlavours[state.flavour].images.map((src, index) => `<button type="button" class="thumbnail" data-action="product-image-${index}" aria-label="View ${state.flavour} image ${index + 1}" aria-pressed="${state.productImage === index}">${image(src, `${state.flavour}, image ${index + 1}`, 'product-thumbnail')}</button>`).join('')}</div></section><section class="purchase-panel"><p class="breadcrumb">Shop / Whey protein</p><h2>${liveTitle()}</h2><div class="price">${livePrice()}<span>Inclusive of taxes</span></div><p>1 kg · 28 servings · 35 g serving size</p><div class="flavour-picker"><span>Choose flavour</span><div class="button-row"><button type="button" class="flavour ${state.flavour === 'Mawa Kulfi' ? 'active' : ''}" data-action="select-Mawa Kulfi">Mawa Kulfi</button><button type="button" class="flavour ${state.flavour === 'Rich Chocolate' ? 'active' : ''}" data-action="select-Rich Chocolate">Rich Chocolate</button></div></div>${variantPicker()}<p role="status">${selectedVariant()?.availableForSale ? 'In stock' : commerce.loading ? 'Checking availability\u2026' : 'Unavailable'}</p><p>${escapeHtml(commerce.products[state.flavour]?.description || '')}</p><div class="coupon-entry">${couponEntry()}</div><div class="product-actions">${productActions()}</div>${deliveryOptions()}${productInside()}</section></div>${productReviews()}${nutritionTrust()}${shopInvitation()}${storeFaq()}${floatingPurchaseBar()}</div>`;
}

function auraQuantity() {
  return `<div class="aura-quantity" role="group" aria-label="Product quantity"><button type="button" data-action="aura-down" aria-label="Decrease quantity" ${state.quantity === 1 ? 'disabled' : ''}>\u2212</button><output class="aura-quantity-value" aria-live="polite">${state.quantity} AURA</output><button type="button" data-action="aura-up" aria-label="Increase quantity">+</button><div class="aura-bursts" aria-hidden="true"></div></div>`;
}

function updateAuraQuantity(action, element) {
  if (action === 'aura-down' && state.quantity === 1) return;
  state.quantity += action === 'aura-up' ? 1 : -1;
  const control = element.closest('.aura-quantity');
  control.querySelector('output').textContent = `${state.quantity} AURA`;
  control.querySelector('[data-action="aura-down"]').disabled = state.quantity === 1;
  showAuraBurst(control, auraFeedback(action));
}

function auraFeedback(action) {
  if (action.endsWith('up')) {
    state.auraDownStreak = 0;
    return `+${state.quantity * 1000} AURA`;
  }
  state.auraDownStreak += 1;
  return `\u2212${state.auraDownStreak * 1000} AURA`;
}

function showAuraBurst(control, text) {
  if (!control) return;
  let bursts = control.querySelector('.aura-bursts');
  if (!bursts) {
    bursts = document.createElement('div');
    bursts.className = 'aura-bursts';
    bursts.setAttribute('aria-hidden', 'true');
    control.appendChild(bursts);
  }
  bursts.querySelector('.aura-burst')?.remove();
  const burst = document.createElement('span');
  burst.className = `aura-burst${text.startsWith('\u2212') ? ' is-negative' : ''}`;
  burst.textContent = text;
  bursts.appendChild(burst);
  burst.addEventListener('animationend', () => burst.remove(), { once: true });
}

function setCartDrawer(open, focusClose = true) {
  const drawer = document.querySelector('.cart-drawer');
  if (!drawer) return;
  cartDrawerState.open = open;
  drawer.classList.toggle('open', open);
  drawer.toggleAttribute('inert', !open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.querySelector('.overlay')?.classList.toggle('open', open);
  document.querySelector('.overlay')?.setAttribute('data-action', open ? 'close-cart' : 'close-menu');
  document.body.classList.toggle('cart-open', open);
  if (open && focusClose) drawer.querySelector('[data-action="close-cart"]')?.focus();
}

function cart() {
  const lines = commerce.cart?.lines.nodes || [];
  if (!lines.length) return `<section class="empty-state"><div>${commerceStatus()}<p class="hero-overline">Your cart</p><h1>Nothing here yet.</h1><p>Pick a flavour to begin your Aura Whey routine.</p>${routeLink('shop', 'Shop whey protein', 'button-link primary')}</div></section>`;
  return `<h1 class="page-title">Your cart</h1>${commerceStatus()}<div class="cart-layout"><section>${lines.map(cartLineMarkup).join('')}</section><aside class="summary">${cartSummaryCard()}</aside></div>`;
}

function checkout() {
  return `<section class="handoff"><div class="handoff-icon">${icon('bag')}</div><p class="hero-overline">Secure checkout</p><h1>Complete your order.</h1><p>Continue to secure checkout for delivery and payment.</p>${commerceStatus()}<div class="button-row">${routeLink('cart', 'Back to cart', 'button-link')}${button('shopify-checkout', 'Continue to checkout', 'primary')}</div></section>`;
}

const documents = [
  ['FSSAI licence', 'Food safety licence', 'Manufacturer licence \u2014 supplied renewal document.', 'fssai.pdf'],
  ['Independent protein test report', 'Laboratory test report', 'Supplied test certificate for sample SMP-050826010, reporting 67.9% total protein.', 'assets/SMP-050826010%20(Aura%20Whey).pdf'],
  ['U.S. FDA facility registration', 'Facility registration', 'Supplied Gomzi Life Sciences LLP food-facility registration. This is a facility registration, not FDA product approval.', 'assets/nutri-certi-6.webp'],
  ['ISO 22000 certificate', 'Food safety management', 'ISO 22000:2018 \u2014 supplied manufacturer certificate.', 'iso-22000.pdf'],
  ['GMP certificate', 'Manufacturing practice', 'Gomzi Life Science LLP \u2014 supplied GMP document.', 'gmp.pdf'],
  ['HACCP certificate', 'Hazard analysis and control', 'Gomzi Life Science LLP \u2014 supplied HACCP document.', 'haccp.pdf'],
  ['Kosher certificate', 'Dietary certification', 'Gomzi Life Science LLP \u2014 supplied Kosher document.', 'kosher.pdf'],
  ['Halal certificate', 'Dietary certification', 'Gomzi Life Science LLP \u2014 supplied Halal document.', 'halal.pdf'],
  ['GST certificate', 'Business registration', 'Manufacturer GST registration; not a product quality certificate.', 'gst.pdf']
];

function documentCard([title, type, detail, file]) {
  const path = file.startsWith('assets/') ? file : `assets/documents/${file}`;
  const isPdf = path.toLowerCase().endsWith('.pdf');
  const format = isPdf ? 'PDF' : 'certificate image';
  return `<article class="card document-card"><div class="document-icon">${icon('file')}</div><p class="document-type">${type}</p><h3>${title}</h3><p>${detail}</p><div class="button-row"><a class="button-link primary" href="${path}" target="_blank" rel="noopener" aria-label="Open ${title} ${format} in a new tab">${isPdf ? 'View PDF' : 'View certificate'}</a><a class="button-link" href="${path}" download aria-label="Download ${title} ${format}">${isPdf ? 'Download PDF' : 'Download image'}</a></div></article>`;
}

function quality() {
  return `<section class="quality-hero" aria-labelledby="quality-title"><img class="quality-hero-image" src="./assets/optimized/site/lab%20image.webp" alt="Illustrative scene of laboratory technicians handling food samples" fetchpriority="high" /><div class="quality-hero-inner"><div class="quality-hero-copy"><p class="hero-overline">Quality & documentation</p><h1 id="quality-title">Quality you can inspect.</h1><p>Explore food-safety and manufacturing information, and learn what to check on your pack.</p></div></div></section><section class="section"><div class="section-inner"><div class="section-head"><div><h2>Certificates</h2><div class="gold-rule"></div></div><p>Food safety, manufacturing, and dietary certification documents.</p></div><div class="grid grid-3">${documents.map(documentCard).join('')}</div></div></section><section class="section"><div class="section-inner quality-process"><div class="quality-process-image">${image(assets.labelMawa, 'Aura Whey product nutrition information')}</div><div><h2>Read the pack first.</h2><p>Nutrition, ingredients, allergen advice, and storage guidance are printed on the product label. We keep the supplied certificates alongside it for straightforward review.</p><div class="button-row">${routeLink('verify', 'Verify a batch', 'button-link primary')}${routeLink('contact', 'Contact support', 'button-link')}</div></div></div></section>`;
}

function searchDialog() {
  return `<dialog id="search-dialog" class="search-dialog" aria-labelledby="search-title"><div class="search-dialog-panel"><div class="search-dialog-heading"><h2 id="search-title">Find your flavour.</h2><button type="button" class="icon-button" data-action="close-search" aria-label="Close search">${icon('close')}</button></div><form class="search-form" data-form="search"><label class="sr-only" for="search-overlay-input">Search products</label><input id="search-overlay-input" name="query" type="search" maxlength="100" placeholder="Try chocolate, kulfi or whey\u2026" autocomplete="off" autofocus /><button type="submit" class="button primary">Search</button></form><p id="search-count" role="status" aria-live="polite"></p><div id="search-products" class="search-product-list"></div></div></dialog>`;
}

function matchingProducts(query) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return Object.keys(productFlavours).filter(flavour => {
    const words = ('aura whey protein ' + flavour + (flavour === 'Mawa Kulfi' ? ' malai creamy' : ' cocoa chocolate')).toLowerCase();
    return terms.every(term => words.includes(term));
  });
}

function updateSearchResults() {
  const input = document.querySelector('#search-overlay-input');
  state.searchQuery = input.value.slice(0, 100);
  const matches = matchingProducts(state.searchQuery);
  document.querySelector('#search-count').textContent = matches.length ? (state.searchQuery.trim() ? matches.length + ' matching product' + (matches.length === 1 ? '' : 's') : 'Explore both flavours') : 'No products found. Try \u201cwhey\u201d, \u201ckulfi\u201d or \u201cchocolate\u201d.';
  document.querySelector('#search-products').innerHTML = matches.map(flavour => `<button type="button" class="search-product ${productFlavours[flavour].theme}" data-action="select-${flavour}">${image(productFlavours[flavour].images[0], 'Aura Whey ' + flavour)}<span><strong>Aura Whey</strong><span>${flavour}</span><small>1 kg · ${livePrice(flavour)}</small></span><span class="search-product-arrow" aria-hidden="true">\u2197</span></button>`).join('');
}

function openSearch() {
  document.querySelector('.mobile-panel')?.classList.remove('open');
  document.querySelector('.overlay')?.classList.remove('open');
  const dialog = document.querySelector('#search-dialog');
  document.querySelector('#search-overlay-input').value = state.searchQuery;
  updateSearchResults();
  dialog.showModal();
  document.body.classList.add('search-open');
  document.querySelector('#search-overlay-input').focus();
}

function closeSearch() {
  document.querySelector('#search-dialog').close();
  document.body.classList.remove('search-open');
}


function account() {
  const authFailure = new URLSearchParams(location.search).has('auth');
  if (customerAccount.loading) return `<section class="page-intro compact account-page"><p class="hero-overline">Your account</p><h1>Checking your account\u2026</h1><p role="status">Loading your secure Shopify account session.</p></section>`;
  if (customerAccount.authenticated) {
    const name = escapeHtml(customerAccount.customer?.displayName || 'Aura Whey customer');
    const email = escapeHtml(customerAccount.customer?.email || '');
    return `<section class="page-intro compact account-page"><p class="hero-overline">Your account</p><h1>Welcome, ${name}.</h1><div class="account-layout"><div class="account-profile"><span class="account-status">Signed in securely with Shopify</span><h2>${name}</h2>${email ? `<p>${email}</p>` : ''}<p>Your order history and fulfillment updates can be displayed here through the authenticated Customer Account API.</p><a class="button-link secondary" href="/api/auth/logout">Sign out</a></div><div class="account-aside"><h3>Your shopping bag stays with you</h3><p>Signing in or out does not reset the products already saved in this browser.</p>${routeLink('cart', 'View your cart', 'text-link')}</div></div></section>`;
  }
  return `<section class="page-intro compact account-page"><p class="hero-overline">Your account</p><h1>Sign in to Aura Whey.</h1>${authFailure || customerAccount.error ? '<div class="result state-invalid" role="alert"><strong>Sign-in was not completed.</strong><p>Please try again. Your cart has not been changed.</p></div>' : ''}<div class="account-layout"><div class="account-sign-in"><p>Continue to Shopify\u2019s secure customer sign-in. Shopify will email you a one-time verification code and return you to Aura Whey.</p><a class="button-link primary" href="/api/auth/login">Continue to secure sign in</a></div><div class="account-aside"><h3>New here?</h3><p>Enter your email on Shopify\u2019s secure page. If you do not have an account yet, Shopify will guide you through the customer account flow.</p>${routeLink('track-order', 'Track an order instead', 'text-link')}</div></div></section>`;
}

function blog() { return `<section class="page-intro"><p class="hero-overline">Aura journal</p><h1>Train with clarity.</h1><p>Practical reads for choosing your product and making your routine easier to keep.</p></section><section class="section"><div class="featured-post"><div class="featured-image">${image(posts[0].image, posts[0].alt)}</div><div><p class="hero-overline">Featured guide</p><h2>${posts[0].title}</h2><p>${posts[0].excerpt}</p>${routeLink(`article/${posts[0].slug}`, 'Read the guide', 'button-link primary')}</div></div></section><section class="section"><div class="section-inner"><div class="grid grid-3">${[0, 1, 2].map(blogCard).join('')}</div></div></section>`; }

function article() {
  const slug = location.pathname.split('/')[2];
  const post = posts.find(item => item.slug === slug) || posts[0];
  return `<article class="article"><p>${routeLink('blog', 'Back to journal', 'text-link')}</p><p class="hero-overline">Aura journal</p><h1>${post.title}</h1><p class="article-meta">Aura Whey Journal · 1 minute read</p><div class="article-hero">${image(post.image, post.alt)}</div><div class="article-layout"><div>${post.sections.map(([heading, copy]) => `<section><h2>${heading}</h2><p>${copy}</p></section>`).join('')}</div><aside class="article-aside"><strong>Explore Aura Whey</strong>${routeLink('shop', 'Shop both flavours', 'text-link')}${routeLink('blog', 'More from the journal', 'text-link')}</aside></div></article>`;
}

function verifyBatch() { return `<section class="page-intro compact batch-verification" aria-labelledby="batch-verification-title"><p class="hero-overline">Batch verification</p><h1 id="batch-verification-title">Find your batch lab report.</h1><p class="batch-verification-intro">Enter the batch number printed on your tub to check whether a third-party laboratory report is available. This lookup verifies a batch report, not an individual product tub.</p><div class="verify-layout"><div class="verify-image">${image(assets.labelMawa, 'Aura Whey pack label showing where product information is printed')}</div><div class="batch-lookup"><h2>Enter batch number</h2><p>Use the batch number exactly as it appears on the product label.</p><form class="form" data-form="batch-verification"><label class="field" for="batch-number">Batch number<input id="batch-number" name="batch" maxlength="40" placeholder="e.g. GN250508" autocomplete="off" autocapitalize="characters" spellcheck="false" required /></label><button type="submit" class="button primary">${icon('search')}<span>Find lab report</span></button></form><div id="batch-result" class="batch-result" role="status" aria-live="polite"></div></div></div></section>`; }

function normalizeBatchNumber(value) { return String(value || '').trim().toUpperCase().replace(/\s+/g, ''); }

function batchReportResult(value) {
  const batchNumber = normalizeBatchNumber(value);
  const report = batchReports[batchNumber];
  if (!report) return `<div class="batch-result-card batch-result-unavailable"><h2>No laboratory report currently available</h2><p>We do not currently have a laboratory report for batch <strong>${escapeHtml(batchNumber)}</strong>. This does not mean the product is fake. Check the batch number printed on the pack or contact support for help.</p>${routeLink('contact', 'Contact support', 'button-link')}</div>`;
  const details = [['Sample', report.sample], ['Manufacturing', report.manufacturing], ['Expiry', report.expiry], ['Laboratory', report.laboratory], ['Report ID', report.reportId], ['Report date', report.reportDate], ['Total Protein test result', report.totalProtein]];
  return `<div class="batch-result-card batch-result-found"><div class="batch-result-heading"><div>${icon('file')}</div><div><p>Report available</p><h2>Batch ${escapeHtml(report.batchNumber)}</h2></div></div><p class="batch-report-note">A third-party laboratory report is available for this batch. This result does not authenticate an individual tub.</p><dl class="batch-details">${details.map(([label, detail]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(detail)}</dd></div>`).join('')}</dl><a class="button-link primary" href="${escapeHtml(report.reportUrl)}" target="_blank" rel="noopener">View Original Lab Report</a></div>`;
}

function trackOrder() { return `<section class="page-intro compact"><p class="hero-overline">Order tracking</p><h1>Where is your order?</h1><div class="track-layout"><div><form class="form" data-form="tracking"><label class="field">Order number<input name="order" placeholder="e.g. AW-1001" /></label><label class="field">Email address<input name="email" type="email" placeholder="Email used at checkout" /></label>${button('find-order', 'Find order', 'primary')}</form><div id="tracking-result" aria-live="polite"></div></div><div class="track-help"><h3>Need help?</h3><p>Your order number is included in the email confirmation sent after checkout.</p>${routeLink('contact', 'Contact support', 'text-link')}</div></div></section>`; }

const faqs = [
  [
    "Which flavours are available?",
    "Choose Mawa Kulfi for a creamy, dessert-inspired profile or Rich Chocolate for a familiar cocoa flavour. <a href=\"/shop\">Shop both flavours</a> or <a href=\"/article/mawa-kulfi-or-rich-chocolate\">read the flavour guide</a>."
  ],
  [
    "What is the source of protein? Is it natural?",
    "Whey is a milk-derived protein. That does not mean every ingredient in a flavoured powder is natural. Check your flavour\u2019s full ingredient list on the pack."
  ],
  [
    "How much protein is in a serving?",
    "Use the nutrition panel on your particular pack for protein content and serving size. Check the <a href=\"/shop\">product details</a> alongside the label before choosing your serving."
  ],
  [
    "When should I consume it?",
    "Choose a convenient time that fits your meals and routine, following the pack directions. A supplement is an addition to a balanced diet. <a href=\"/article/plan-your-protein-routine\">Explore a simple routine</a>."
  ],
  [
    "How do I prepare it?",
    "Measure the serving and mix with the amount of liquid specified on your pack. Shake or stir as directed. Use clean equipment and follow the label rather than estimating the scoop size."
  ],
  [
    "Is it safe for lactose-intolerant individuals?",
    "Whey products may contain lactose, and tolerance varies. Do not assume this product is lactose-free. Check the label and ask your clinician if unsure. Milk allergy is different: milk-derived whey should be avoided if you have a milk allergy."
  ],
  [
    "Will it cause bloating, gas or acne?",
    "We cannot promise that any powder will be symptom-free for everyone. Lactose can cause digestive symptoms in people who do not tolerate it. If you notice digestive or skin symptoms, stop using it and discuss them with a healthcare professional."
  ],
  [
    "What is the shelf life?",
    "Use the manufacturing and best-before dates printed on your pack. Shelf life and any instructions after opening should come from that label, not from another brand\u2019s product."
  ],
  [
    "How should I store it?",
    "Follow the pack\u2019s storage directions. Keep the container tightly closed, protect it from moisture and use a clean, dry scoop. Check the label for any additional temperature or handling requirements."
  ],
  [
    "How is Aura Whey different?",
    "Aura offers Mawa Kulfi and Rich Chocolate flavour choices with product information and a quality library to explore. Compare ingredients, serving sizes and documentation when choosing; we do not claim it is superior to every other powder."
  ],
  [
    "Is it manufactured locally or imported?",
    "Check the manufacturer, country of origin and any importer details printed on your pack. <a href=\"/contact\">Contact us</a> with a pack photo or batch details if you need help confirming the origin."
  ],
  [
    "Is it suitable for vegetarians?",
    "Whey is dairy-derived and is not vegan. For vegetarian suitability of the complete formula, check the vegetarian mark and ingredients on your pack, including any enzymes."
  ],
  [
    "Is it suitable for women?",
    "Protein is a dietary nutrient for women as well as men. Whether this particular supplement suits you depends on your diet, allergies and health needs. Follow the adult-use label and seek individual advice where needed."
  ],
  [
    "Do I need protein powder if I do not go to the gym?",
    "Going to the gym does not determine whether you need a supplement. If your meals meet your protein needs, powder may be unnecessary. A qualified dietitian can help assess your diet."
  ],
  [
    "Does protein powder cause weight gain?",
    "A serving contributes to your overall food and energy intake. It does not guarantee weight gain or weight loss. Consider how it fits into your usual meals and goals."
  ],
  [
    "Can teenagers use it?",
    "This storefront presents an adult product. Do not give it to someone under 18 without advice from their clinician or a qualified dietitian and confirmation that the product label allows it."
  ],
  [
    "Will I automatically grow big muscles?",
    "A shake alone does not automatically create large muscles. Training, overall nutrition and individual factors influence results. No specific physique or result is guaranteed."
  ],
  [
    "What is lecithin, and is it in this product?",
    "If lecithin is listed on your pack, contact us for its source and intended role in that formula. We have not confirmed its presence here, so do not assume this product contains it or is soy-free."
  ],
  [
    "What is bromelain, and is it in this product?",
    "Check the ingredient list for bromelain and contact us for details if it appears. Its inclusion and amount have not been confirmed for this product; we do not promise enzyme-related digestive benefits."
  ],
  [
    "Is it suitable during pregnancy or breastfeeding?",
    "Ask your obstetrician or healthcare professional to review the full product label before use. We cannot confirm suitability during pregnancy or breastfeeding from general product information."
  ],
  [
    "Is it suitable for people with diabetes?",
    "Ask your treating clinician or dietitian to review the complete nutrition and ingredient panels alongside your care plan. Do not assume a whey supplement is sugar-free or suitable for diabetes."
  ],
  [
    "Can I use it in cooking?",
    "Follow the pack\u2019s preparation instructions. If cooking or heating guidance is not provided, <a href=\"/contact\">ask support</a> before using it in a recipe. We have not validated this formula for cooking."
  ],
  [
    "What is the difference between whey concentrate and isolate?",
    "These are different forms of whey protein. Compare their declared protein, lactose, fat and ingredient information on the labels rather than assuming they are interchangeable. This product\u2019s precise blend should be confirmed from its pack."
  ],
  [
    "Which processing method is used?",
    "We have not confirmed the filtration or processing method for this formula. <a href=\"/contact\">Contact us</a> for manufacturer information; we do not claim cold processing or a specific filtration technique without documentation."
  ],
  [
    "Where can I find quality certificates?",
    "Visit <a href=\"/quality\">Quality & lab reports</a> for the document categories. Source certificate files are not yet available in this preview. Contact support if you need a certificate before ordering."
  ],
  [
    "How do I find a batch laboratory report?",
    "Open <a href=\"/verify\">Verify batch</a> and enter the batch number printed on the product label. The lookup shows available batch-level laboratory reports; it does not authenticate an individual tub."
  ],
  [
    "How can I track an order or request a return?",
    "Visit <a href=\"/track-order\">Track order</a> for the tracking form, <a href=\"/policy\">store policies</a> for shipping and return information, or <a href=\"/contact\">contact support</a>. Live order lookup is not connected in this preview."
  ]
];

function faqItems(limit = false) { return `<div class="accordion">${faqs.slice(0, limit ? 2 : faqs.length).map(([question, answer], index) => `<div><button type="button" data-action="faq-${index}" aria-expanded="false"><span>${question}</span>${icon('chevron')}</button><div class="accordion-panel" hidden>${answer}</div></div>`).join('')}</div>`; }
function faq() { return ''; }

function contact() { return `<section class="page-intro compact"><p class="hero-overline">Contact Aura Whey</p><h1>How can we help?</h1><div class="contact-layout"><div><form class="form" data-form="contact"><label class="field">Name<input name="name" placeholder="Your name" /></label><label class="field">Email address<input name="email" type="email" placeholder="you@example.com" /></label><label class="field">Message<textarea name="message" rows="5" placeholder="Tell us how we can help"></textarea></label>${button('send-message', 'Send message', 'primary')}</form><div id="contact-result" aria-live="polite"></div></div><div class="contact-aside"><h3>Before you contact us</h3><p>For an existing order, keep your order number nearby. For batch verification, keep the batch number printed on your pack.</p>${routeLink('track-order', 'Track an order', 'text-link')}${routeLink('verify', 'Verify a batch', 'text-link')}</div></div></section>`; }

function policy() { return `<section class="page-intro compact"><p class="hero-overline">Policies</p><h1>Store policies.</h1><div class="policy-grid"><article><h2>Shipping</h2><p>Shipping availability, timelines, and charges are confirmed during Shopify checkout.</p></article><article><h2>Returns</h2><p>Return eligibility is reviewed by support based on the order and product condition.</p></article><article><h2>Privacy</h2><p>Customer information is used to process orders, provide support, and improve the store experience.</p></article></div><p class="small">These policy summaries will be replaced with the approved legal policy text before store launch.</p></section>`; }

function documentPage() {
  const doc = documents.find(([title]) => title === state.document) || documents[0];
  return `<section class="page-intro compact"><p class="hero-overline">Manufacturer document</p><h1>${doc[0]}</h1>${documentCard(doc)}<p>${routeLink('quality', 'Back to quality documents', 'button-link')}</p></section>`;
}

const views = { home, shop, cart, checkout, quality, blog, article, verify: verifyBatch, 'track-order': trackOrder, faq, contact, policy, document: documentPage, account };

function currentRoute() { return location.pathname.replace(/^\//, '').split('/')[0] || 'home'; }
function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.dataset.coupon = state.couponOpen ? 'open' : 'closed';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.theme === 'dark' ? '#0a0a0a' : '#f7f4ed');
}
let heroTimer = null;
let purchaseBarObserver = null;
let purchaseBarFallbackCleanup = null;
let purchaseBarState = { visible: false };
let cartDrawerState = { open: false };

let heroRequest = 0;
let heroObserver;
let heroVisible = true;
let heroHovered = false;
function prepareHeroImage(img) {
  if (!img) return;
  const source = img.parentElement.querySelector('source[data-srcset]');
  if (source) { source.srcset = source.dataset.srcset; source.removeAttribute('data-srcset'); }
  if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
  img.loading = 'eager';
}
async function setHeroSlide(index) {
  const count = heroSlides.length;
  const next = ((index % count) + count) % count;
  const request = ++heroRequest;

  const carousel = document.querySelector('#hero-carousel');
  if (!carousel) return;
  const incoming = carousel.querySelector(`[data-slide-index="${next}"] img`);
  if (incoming) {
    prepareHeroImage(incoming);
    try { await incoming.decode(); } catch { return; }
  }
  if (request !== heroRequest || !carousel.isConnected) return;
  state.heroSlide = next;

  const slides = document.querySelectorAll('#hero-carousel .hero-slide');
  slides.forEach((el, i) => {
    const isActive = i === state.heroSlide;
    el.classList.toggle('is-active', isActive);
    el.setAttribute('aria-hidden', !isActive);
    const link = el.querySelector('.hero-slide-link');
    if (link) link.tabIndex = isActive ? 0 : -1;
  });

  const indicators = document.querySelectorAll('#hero-carousel .hero-indicator');
  indicators.forEach((ind, i) => {
    const isActive = i === state.heroSlide;
    ind.classList.toggle('is-active', isActive);
    ind.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  const ambientBg = document.querySelector('#hero-ambient-bg');
  if (ambientBg && heroSlides[state.heroSlide]) {
    ambientBg.style.backgroundImage = `url('${heroSlides[state.heroSlide].ambientImage}')`;
  }

  resetHeroTimer();
  const upcoming = carousel.querySelector(`[data-slide-index="${(next + 1) % count}"] img`);
  prepareHeroImage(upcoming);
}

function startHeroTimer() {
  stopHeroTimer();
  if (currentRoute() !== 'home' || document.hidden || !heroVisible || heroHovered || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  heroTimer = setInterval(() => {
    setHeroSlide(state.heroSlide + 1);
  }, 5000);
}

function stopHeroTimer() {
  if (heroTimer) {
    clearInterval(heroTimer);
    heroTimer = null;
  }
}

function resetHeroTimer() {
  startHeroTimer();
}

function initHeroCarousel() {
  heroObserver?.disconnect();
  heroRequest++;
  heroHovered = false;
  const carousel = document.querySelector('#hero-carousel');
  if (!carousel) {
    stopHeroTimer();
    return;
  }

  carousel.onmouseenter = () => { heroHovered = true; stopHeroTimer(); };
  carousel.onmouseleave = () => { heroHovered = false; startHeroTimer(); };
  if (window.IntersectionObserver) {
    heroObserver = new window.IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) startHeroTimer(); else stopHeroTimer();
    });
    heroObserver.observe(carousel);
  }
  const first = carousel.querySelector('.is-active img');
  first?.decode().then(() => {
    if (!carousel.isConnected) return;
    const next = carousel.querySelector(`[data-slide-index="${(state.heroSlide + 1) % heroSlides.length}"] img`);
    prepareHeroImage(next);
  }).catch(() => {});

  let startX = 0;
  let startY = 0;
  carousel.ontouchstart = (e) => {
    startX = e.changedTouches[0].screenX;
    startY = e.changedTouches[0].screenY;
  };

  carousel.ontouchend = (e) => {
    const diffX = e.changedTouches[0].screenX - startX;
    const diffY = e.changedTouches[0].screenY - startY;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        setHeroSlide(state.heroSlide + 1);
      } else {
        setHeroSlide(state.heroSlide - 1);
      }
    }
  };

  startHeroTimer();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopHeroTimer(); else startHeroTimer();
});

function initFloatingPurchaseBar() {
  purchaseBarObserver?.disconnect();
  purchaseBarObserver = null;
  purchaseBarFallbackCleanup?.();
  purchaseBarFallbackCleanup = null;
  const purchaseGallery = document.querySelector('.product-main-image');
  const purchaseBar = document.querySelector('#floating-purchase');
  if (!purchaseGallery || !purchaseBar) return;

  const setVisible = (visible, animate = true) => {
    purchaseBarState.visible = visible;
    if (!animate) purchaseBar.classList?.add?.('no-transition');
    purchaseBar.classList.toggle('is-visible', visible);
    purchaseBar.setAttribute('aria-hidden', String(!visible));
    if (!animate) {
      void purchaseBar.offsetHeight;
      purchaseBar.classList?.remove?.('no-transition');
    }
  };
  // Re-rendering rebuilds the bar from scratch, so it mounts in its hidden state.
  // Re-apply the last known state without animating, otherwise the bar drops out and
  // slides back up on every cart update ("flicker" while adding to cart).
  setVisible(purchaseBarState.visible, false);

  if (!('IntersectionObserver' in window)) {
    const headerHeight = Math.ceil(document.querySelector('.site-header')?.getBoundingClientRect().height || 0);
    const updateVisibility = () => {
      const bounds = purchaseGallery.getBoundingClientRect();
      setVisible(bounds.bottom <= headerHeight);
    };
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    updateVisibility();
    purchaseBarFallbackCleanup = () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
    return;
  }

  const headerHeight = Math.ceil(document.querySelector('.site-header')?.getBoundingClientRect().height || 0);
  purchaseBarObserver = new window.IntersectionObserver(([entry]) => {
    setVisible(!entry.isIntersecting);
  }, { threshold: 0, rootMargin: `-${headerHeight}px 0px 0px 0px` });
  purchaseBarObserver.observe(purchaseGallery);
}

function refreshCommerceView() {
  if (!document.createElement || !document.querySelector('main')) return render();
  const active = document.activeElement;
  const focusAction = active?.dataset?.action;
  const focusLine = active?.dataset?.lineId;
  const route = currentRoute();
  const template = document.createElement('template');
  if (['home', 'shop', 'cart', 'checkout'].includes(route)) template.innerHTML = (views[route] || home)();
  const status = document.querySelector('main .commerce-status');
  if (status) status.innerHTML = commerceStatus();
  // Replace commerce UI only, retaining the gallery, hero, reviews and scroll position.
  for (const selector of route === 'home' ? ['.product-card-body'] : route === 'shop' ? ['.purchase-panel', '.floating-purchase-actions', '.floating-product-summary'] : []) {
    const existing = document.querySelectorAll('main ' + selector);
    template.content.querySelectorAll(selector).forEach((next, index) => existing[index]?.replaceWith(next));
  }
  if (route === 'cart' || route === 'checkout') document.querySelector('main').innerHTML = template.innerHTML;
  const drawer = document.querySelector('.cart-drawer-body');
  if (drawer) drawer.innerHTML = cart();
  document.querySelectorAll('.cart-count').forEach(node => {
    node.textContent = state.cart;
    node.setAttribute('aria-label', `${state.cart} items in cart`);
    node.closest('button')?.setAttribute('aria-label', `${state.cart} items in cart, open cart`);
  });
  bindEvents();
  if (route === 'shop') initFloatingPurchaseBar();
  if (focusAction && !active.isConnected) {
    const replacement = [...document.querySelectorAll('[data-action]')].find(node => node.dataset.action === focusAction && node.dataset.lineId === focusLine);
    replacement?.focus({ preventScroll: true });
  }
}

function render() {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const active = document.activeElement;
  const focusKey = active && active.dataset.action ? active.dataset.action : null;
  const focusLineId = active?.dataset?.lineId || '';
  const selectionStart = typeof active?.selectionStart === 'number' ? active.selectionStart : null;
  const selectionEnd = typeof active?.selectionEnd === 'number' ? active.selectionEnd : null;
  const drawerOpen = cartDrawerState.open;
  document.body.classList.remove('search-open');
  document.body.classList.remove('menu-open');
  applyTheme();
  shell((views[currentRoute()] || home)());
  bindEvents();
  initHeroCarousel();
  initFloatingPurchaseBar();
  showSavedReview();
  loadReviewsForPage();
  if (drawerOpen) setCartDrawer(true, false);
  if (window.scrollX !== scrollX || window.scrollY !== scrollY) window.scrollTo({ top: scrollY, left: scrollX, behavior: 'instant' });
  if (!focusKey) return;
  const restored = [...document.querySelectorAll(`[data-action="${focusKey}"]`)].find(el => (el.dataset.lineId || '') === focusLineId);
  if (!restored || restored.disabled) return;
  restored.focus({ preventScroll: true });
  if (selectionStart !== null && typeof restored.setSelectionRange === 'function') restored.setSelectionRange(selectionStart, selectionEnd);
}

async function initCustomerAccount() {
  customerAccount.loading = true;
  customerAccount.error = '';
  try {
    const response = await fetch('/api/auth/session', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Account session request failed.');
    const result = await response.json();
    customerAccount.authenticated = Boolean(result.authenticated);
    customerAccount.customer = result.customer || null;
  } catch (error) {
    customerAccount.authenticated = false;
    customerAccount.customer = null;
    customerAccount.error = error.message;
  } finally {
    customerAccount.loading = false;
    if (currentRoute() === 'account') render();
    else document.querySelectorAll('a[data-route="account"]').forEach(link => {
      link.setAttribute('aria-label', customerAccount.authenticated ? 'Your account' : 'Sign in or log in');
    });
  }
}
function navigate(route) { history.pushState(null, '', route === 'home' ? '/' : `/${route}`); if (cartDrawerState.open) setCartDrawer(false, false); render(); if (commerce.loading && !commerce.busy) initCommerce(); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const url = new URL(link.href, location.origin);
  if (url.origin !== location.origin || url.hash || url.search) return;
  const route = url.pathname.replace(/^\//, '').replace(/\/$/, '') || 'home';
  if (!views[route.split('/')[0]]) return;
  if (cartDrawerState.open) setCartDrawer(false, false);
  event.preventDefault();
  navigate(route);
});

function setMobileMenu(open) {
  const panel = document.querySelector('.mobile-panel');
  panel.classList.toggle('open', open);
  panel.toggleAttribute('inert', !open);
  panel.setAttribute('aria-hidden', String(!open));
  document.querySelector('.overlay').classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  const trigger = document.querySelector('.menu-button');
  trigger.setAttribute('aria-expanded', String(open));
  trigger.setAttribute('aria-controls', 'mobile-menu');
  (open ? panel.querySelector('.menu-close') : trigger)?.focus();
}
document.addEventListener('change', event => {
  const select = event.target.closest('[data-qty-select]');
  if (!select) return;
  const line = commerce.cart?.lines.nodes.find(item => item.id === select.dataset.lineId);
  const quantity = Number(select.value);
  if (!line || !Number.isInteger(quantity) || quantity < 1 || quantity === line.quantity) return;
  cartOperation(() => commerce.client.update(commerce.cart.id, [{ id: line.id, quantity }]));
});
document.addEventListener('click', event => {
  const element = event.target.closest('[data-action]');
  // #search-products has its own handler that closes the dialog before dispatching.
  if (!element || element.closest('#search-products')) return;
  handleAction(element.dataset.action, element);
});
document.addEventListener('keydown', event => {
  const drawer = document.querySelector('.cart-drawer.open');
  if (drawer && event.key === 'Escape') { event.preventDefault(); return setCartDrawer(false); }
  if (drawer && event.key === 'Tab') {
    const nodes = [...drawer.querySelectorAll('a[href], button:not([disabled]), input')];
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    return;
  }
  const panel = document.querySelector('.mobile-panel.open');
  if (!panel) return;
  if (event.key === 'Escape') { event.preventDefault(); setMobileMenu(false); }
  if (event.key === 'Tab') {
    const nodes = [...panel.querySelectorAll('a[href], button, input')];
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.addEventListener('popstate', () => { if (document.querySelector('.mobile-panel.open')) setMobileMenu(false); if (document.querySelector('.cart-drawer.open')) setCartDrawer(false); });

function bindEvents() {
  // Rebinding after partial updates must not accumulate event listeners.
  document.querySelectorAll('form[data-form]').forEach(form => { form.onsubmit = handleForm; });
  const dialog = document.querySelector('#search-dialog');
  dialog.onclose = () => document.body.classList.remove('search-open');
  dialog.onclick = event => { if (event.target === dialog) closeSearch(); };
  document.querySelector('#search-overlay-input').oninput = updateSearchResults;
  document.querySelector('#search-products').onclick = event => {
    const card = event.target.closest('[data-action]');
    if (card) { closeSearch(); handleAction(card.dataset.action, card); }
  };
  document.querySelectorAll('[data-route]').forEach(link => { link.onclick = () => setTimeout(() => document.querySelector('main')?.focus(), 0); });
  const variantSelect = document.querySelector('[data-variant-select]');
  if (variantSelect) variantSelect.onchange = event => {
    commerce.products[state.flavour].selectedVariantId = event.target.value;
    const variant = selectedVariant();
    const index = productFlavours[state.flavour].images.indexOf(variant.image?.url);
    state.productImage = Math.max(0, index);
    state.quantity = 1;
    render();
  };
  document.querySelectorAll('.peek-rating-stars').forEach(group => {
    if (group.dataset.bound) return;
    group.dataset.bound = 'true';
    let selected = Number(group.querySelector('input:checked')?.value || 0);
    updatePeekRating(group, selected);
    group.querySelectorAll('input').forEach(input => {
      const item = input.closest('label');
      item.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') updatePeekRating(group, Number(input.value));
      });
      input.addEventListener('focus', () => updatePeekRating(group, Number(input.value)));
      input.addEventListener('click', () => {
        selected = selected === Number(input.value) ? 0 : Number(input.value);
        group.querySelectorAll('input').forEach(radio => { radio.checked = Number(radio.value) === selected; });
        updatePeekRating(group, selected);
        const star = item.querySelector('[aria-hidden]');
        if (selected && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          star.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 320 });
        }
      });
    });
    group.addEventListener('pointerleave', () => updatePeekRating(group, selected));
    group.addEventListener('focusout', event => {
      if (!group.contains(event.relatedTarget)) updatePeekRating(group, selected);
    });
  });
}

function updatePeekRating(group, value) {
  if (!group) return;
  const labels = ['Poor', 'Fair', 'Good', 'Great', 'Superb'];
  const tip = group.querySelector('.peek-rating-tip');
  if (tip) tip.textContent = value ? labels[value - 1] : 'Choose a rating';
  group.querySelectorAll('[data-rating]').forEach(item => {
    item.classList.toggle('is-previewed', Number(item.dataset.rating) <= value);
    item.classList.toggle('is-current', Number(item.dataset.rating) === value);
  });
  if (tip) tip.style.left = `${value ? (value - 1) * 48 + 22 : 110}px`;
}

function showToast(message) {
  let toast = document.querySelector('#site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'site-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 2000);
}

async function handleAction(action, element) {
  if (action === 'open-search') return openSearch();
  if (action === 'close-search') return closeSearch();
  if (action === 'apply-coupon') return applyShopifyCoupon('DISC5');
  if (action === 'remove-coupon') {
    if (commerce.busy) return;
    const codes = (commerce.cart?.discountCodes || []).filter(code => code.code !== element.dataset.code).map(code => code.code);
    return commerce.cart ? cartOperation(() => commerce.client.discount(commerce.cart.id, codes)) : applyShopifyCoupon('');
  }
  if (action === 'change-pincode') {
    state.delivery = { pincode: '', status: 'idle', message: '' };
    render();
    document.querySelector('#summary-pincode')?.focus();
    return;
  }
  if (action === 'check-pincode') {
    const input = document.querySelector('#summary-pincode');
    if (!input || state.delivery.status === 'checking') return;
    return handleForm({ preventDefault() {}, currentTarget: { dataset: { form: 'delivery-check' }, elements: { pincode: input } } });
  }
  if (action === 'retry-shopify') return initCommerce();
  if (action.startsWith('line-')) return changeCartLine(action, element.dataset.lineId);
  if (action === 'box-up' || action === 'box-down') {
    const line = productCartLine();
    // A decrement on a product that is not in the cart would do nothing visible.
    if (!line?.quantity) return;
    const newQuantity = line.quantity + (action === 'box-up' ? 1 : -1);
    if (newQuantity < 1) return;
    await setCartLineQuantity(line, action === 'box-up' ? 1 : -1);
    if (action === 'box-up') state.auraDownStreak = 0; else state.auraDownStreak += 1;
    const control = document.querySelector('.product-actions .pack-row') || document.querySelector('.floating-qty-group');
    showAuraBurst(control, action === 'box-up' ? `+${newQuantity * 1000} AURA` : `\u2212${state.auraDownStreak * 1000} AURA`);
    return;
  }
  if (action === 'open-remove') { const line = productCartLine(); if (line) openRemoveModal(line); return; }
  if (action === 'toggle-theme') { state.theme = state.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('aura-theme', state.theme); return render(); }
  if (action === 'toggle-coupon') { state.couponOpen = false; return render(); }
  if (action === 'show-coupon') { state.couponOpen = true; return render(); }
  if (action === 'hero-next') return setHeroSlide(state.heroSlide + 1);
  if (action === 'hero-prev') return setHeroSlide(state.heroSlide - 1);
  if (action === 'reviews-prev' || action === 'reviews-next') {
    const showcase = element.closest('.product-reviews');
    const track = showcase?.querySelector('.review-card-track');
    if (!track) return;
    const card = track.querySelector('.review-card');
    const distance = (card?.getBoundingClientRect().width || 280) + 16;
    track.scrollBy({ left: action === 'reviews-prev' ? -distance : distance, behavior: 'smooth' });
    return;
  }
  if (action.startsWith('hero-') && /^hero-\d+$/.test(action)) {
    return setHeroSlide(Number(action.replace('hero-', '')));
  }
  if (action === 'open-menu') return setMobileMenu(true);
  if (action === 'close-menu') return setMobileMenu(false);
  if (action === 'open-cart') { if (commerce.loading && !commerce.busy) initCommerce(true); return setCartDrawer(true); }
  if (action === 'close-cart') return setCartDrawer(false);
  if (action === 'go-shop') return navigate('shop');
  if (action.startsWith('select-')) { state.flavour = action.replace('select-', ''); state.productImage = 0; state.imageZoom = 1; return currentRoute() === 'shop' ? render() : navigate('shop'); }
  if (action.startsWith('product-image-')) {
    state.productImage = Number(action.replace('product-image-', ''));
    state.imageZoom = 1;
    const galleryImage = document.querySelector('.product-main-image img');
    galleryImage.src = productFlavours[state.flavour].images[state.productImage];
    galleryImage.srcset = [160, 640].map(size => `${galleryImage.src.replace('.webp', `-${size}.jpg`)} ${size}w`).concat(`${galleryImage.src} 1254w`).join(', ');
    galleryImage.alt = `Aura Whey ${state.flavour}, image ${state.productImage + 1}`;
    galleryImage.style = galleryImage.style || {};
    galleryImage.style.transform = 'scale(1)';
    const reset = document.querySelector('[data-action="zoom-reset"]');
    reset?.querySelector?.('span') && (reset.querySelector('span').textContent = '100%');
    document.querySelectorAll('.thumbnail[data-action]').forEach(thumbnail => thumbnail.setAttribute('aria-pressed', String(thumbnail === element)));
    return;
  }
  if (action.startsWith('add-flavour-')) return addShopifyProduct(action.replace('add-flavour-', ''), 1);
  if (action.startsWith('tab-')) { state.tab = action.replace('tab-', ''); return render(); }
  if (action === 'add-cart') return addShopifyProduct(state.flavour, state.quantity);
  if (action === 'buy-now') return addShopifyProduct(state.flavour, state.quantity, true);
  if (action === 'aura-up' || action === 'aura-down') return updateAuraQuantity(action, element);
  if (action === 'checkout' || action === 'shopify-checkout') return openShopifyCheckout();
  if (action.startsWith('view-document-')) { state.document = action.replace('view-document-', ''); return navigate('document'); }
  if (action.startsWith('faq-')) { const panel = element.nextElementSibling; const expanded = element.getAttribute('aria-expanded') === 'true'; element.setAttribute('aria-expanded', String(!expanded)); panel.hidden = expanded; return; }
}

async function handleForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (form.dataset.form === 'delivery-check') {
    const pincode = form.elements.pincode.value.trim();
    state.delivery.pincode = pincode;
    if (!/^\d{6}$/.test(pincode)) {
      state.delivery.status = 'error';
      state.delivery.message = 'Enter a valid 6-digit pincode.';
      render();
      document.querySelector('#delivery-pincode')?.focus();
      return;
    }
    state.delivery.status = 'checking';
    state.delivery.message = 'Checking delivery availability\u2026';
    render();
    try {
      const endpoint = window.AURA_SHIPPING_ENDPOINT || '/api/shipping/check';
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pincode, flavour: state.flavour, quantity: state.quantity, weight: 1, cod: true }) });
      const result = await response.json();
      if (!response.ok || !result.available) throw new Error(result.message || 'Delivery is not available for this pincode.');
      state.delivery.status = 'ready';
      state.delivery.message = result.message || `Delivery available${result.eta ? ` · Estimated delivery ${result.eta}` : ''}.`;
    } catch (error) {
      state.delivery.status = 'unavailable';
      state.delivery.message = error.message === 'Shipping endpoint is not configured.'
        ? 'Pincode accepted. Delivery availability will be confirmed at checkout.'
        : error.message;
    }
    render();
    return;
  }
  if (form.dataset.form === 'review') {
    if (!form.reportValidity()) return;
    const name = form.elements.reviewName.value.trim();
    const text = form.elements.reviewText.value.trim();
    const rating = Number(form.elements.rating.value);
    const result = document.querySelector('#review-result');
    if (!name || text.length < 10 || text.length > 1000 || name.length > 60 || !Number.isInteger(rating) || rating < 1 || rating > 5) { result.textContent = 'Add your name, a rating and at least 10 characters about your experience.'; return; }
    const submit = form.querySelector('button[type="submit"]'); submit.disabled = true; result.textContent = 'Publishing your review...';
    try {
      const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ productHandle: SHOPIFY_CONFIG.products[state.flavour], displayName: name, rating, reviewText: text, website: form.elements.website.value }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Unable to publish your review.');
      result.textContent = 'Thanks — your review is now live.';
      form.reset(); reviewData.product = [payload.review, ...(reviewData.product || [])];
      const board = document.querySelector('[data-review-scope="product"] .review-board'); if (board) board.innerHTML = approvedReviewCards(reviewData.product, 'product');
    } catch (error) { result.textContent = error.message; }
    finally { submit.disabled = false; }
    return;
  }
  if (form.dataset.form === 'coupon') return applyShopifyCoupon(form.elements.coupon.value.trim().toUpperCase());
  if (form.dataset.form === 'batch-verification') {
    if (!form.reportValidity()) return;
    document.querySelector('#batch-result').innerHTML = batchReportResult(form.elements.batch.value);
    return;
  }
  if (form.dataset.form === 'tracking') {
    const order = form.elements.order.value.trim().toUpperCase();
    const email = form.elements.email.value.trim();
    const found = order === 'AW-1001' && email;
    document.querySelector('#tracking-result').innerHTML = found ? '<div class="result state-valid"><strong>Order found</strong><p>Your order is confirmed. Courier details and delivery updates will appear here after Shopify tracking is connected.</p></div>' : '<div class="result state-invalid"><strong>No matching order</strong><p>Check the order number and email address, then try again.</p></div>';
    return;
  }
  if (form.dataset.form === 'contact') { document.querySelector('#contact-result').innerHTML = '<div class="result state-valid"><strong>Message received</strong><p>Thanks. The support team will reply to the email address you provided.</p></div>'; return; }
  if (form.dataset.form === 'search') return updateSearchResults();
}

window.addEventListener('popstate', () => {
  render();
  if (commerce.loading && !commerce.busy) initCommerce();
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { render(); initCommerce(); initCustomerAccount(); });
} else {
  render();
  initCommerce();
  initCustomerAccount();
}
