import { Footer } from './components/layout/Footer.js';
import { Header } from './components/layout/Header.js';
import { MobileMenu } from './components/layout/MobileMenu.js';
import { initHeroCarousel, stopHeroCarousel } from './components/hero/HeroCarousel.js';
import { heroSlides } from './data/hero-slides.js';
import { HomePage } from './pages/HomePage.js';
import { AccountPage, ArticlePage, AuthenticatePage, BlogPage, CartPage, CheckoutPage, ContactPage, DocumentPage, FaqPage, PolicyPage, QualityPage, SearchPage, ShopPage, TrackOrderPage } from './pages/StorePages.js';
import { currentRoute, navigate } from './routes/router.js';
import { state } from './state/store.js';

const root = document.querySelector('#app');
const pages = { home: HomePage, shop: ShopPage, cart: CartPage, checkout: CheckoutPage, quality: QualityPage, blog: BlogPage, article: ArticlePage, authenticate: AuthenticatePage, 'track-order': TrackOrderPage, faq: FaqPage, contact: ContactPage, policy: PolicyPage, document: DocumentPage, search: SearchPage, account: AccountPage };

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.theme === 'dark' ? '#0a0a0a' : '#f1eee7');
}

function render() {
  applyTheme();
  const route = currentRoute();
  root.innerHTML = `<div class="shell">${Header({ route, state })}${MobileMenu({ route, state })}<main tabindex="-1">${(pages[route] || HomePage)(state)}</main>${Footer()}</div>`;
  bindEvents();
  initHeroCarousel({ getIndex: () => state.heroSlide, setIndex: setHeroSlide, isHome: () => currentRoute() === 'home' });
}

function setHeroSlide(index) {
  state.heroSlide = ((index % heroSlides.length) + heroSlides.length) % heroSlides.length;
  const carousel = document.querySelector('#hero-carousel');
  if (!carousel) return;
  carousel.querySelectorAll('.hero-slide').forEach((slide, slideIndex) => {
    const active = slideIndex === state.heroSlide;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    const link = slide.querySelector('.hero-slide-link');
    if (link) link.tabIndex = active ? 0 : -1;
  });
  carousel.querySelectorAll('.hero-indicator').forEach((indicator, indicatorIndex) => {
    const active = indicatorIndex === state.heroSlide;
    indicator.classList.toggle('is-active', active);
    indicator.setAttribute('aria-selected', String(active));
  });
  initHeroCarousel({ getIndex: () => state.heroSlide, setIndex: setHeroSlide, isHome: () => currentRoute() === 'home' });
}

function showToast(message) {
  let toast = document.querySelector('#site-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'site-toast';
    toast.className = 'site-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function bindEvents() {
  document.querySelectorAll('[data-route]').forEach(link => link.addEventListener('click', () => setTimeout(() => document.querySelector('main')?.focus(), 0)));
  document.querySelectorAll('[data-action]').forEach(element => element.addEventListener('click', () => handleAction(element.dataset.action, element)));
  document.querySelectorAll('form[data-form]').forEach(form => form.addEventListener('submit', handleForm));
}

function handleAction(action, element) {
  if (action === 'apply-coupon') { state.coupon = 'DISC5'; showToast('Coupon “DISC5” applied! 5% discount active.'); return render(); }
  if (action === 'toggle-theme') { state.theme = state.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('aura-theme', state.theme); return render(); }
  if (action === 'hero-next') return setHeroSlide(state.heroSlide + 1);
  if (action === 'hero-prev') return setHeroSlide(state.heroSlide - 1);
  if (action.startsWith('hero-') && /^hero-\d+$/.test(action)) return setHeroSlide(Number(action.replace('hero-', '')));
  if (action === 'open-menu') { document.querySelector('.mobile-panel')?.classList.add('open'); document.querySelector('.overlay')?.classList.add('open'); return; }
  if (action === 'close-menu') { document.querySelector('.mobile-panel')?.classList.remove('open'); document.querySelector('.overlay')?.classList.remove('open'); return; }
  if (action.startsWith('select-')) { state.flavour = action.replace('select-', ''); return currentRoute() === 'shop' ? render() : navigate('shop'); }
  if (action.startsWith('tab-')) { state.tab = action.replace('tab-', ''); return render(); }
  if (action === 'add-cart') { state.cart = 1; return navigate('cart'); }
  if (action === 'remove-cart') { state.cart = 0; state.quantity = 1; return render(); }
  if (action === 'quantity-up') { state.quantity += 1; return render(); }
  if (action === 'quantity-down') { state.quantity = Math.max(1, state.quantity - 1); return render(); }
  if (action === 'checkout') return navigate('checkout');
  if (action === 'shopify-checkout') { document.querySelector('#checkout-result').innerHTML = '<div class="result state-valid"><strong>Checkout handoff ready</strong><p>Connect your Shopify Storefront API or checkout URL here when the store credentials are available.</p></div>'; return; }
  if (action.startsWith('view-document-')) { state.document = action.replace('view-document-', ''); return navigate('document'); }
  if (action.startsWith('faq-')) { const panel = element.nextElementSibling; const expanded = element.getAttribute('aria-expanded') === 'true'; element.setAttribute('aria-expanded', String(!expanded)); panel.hidden = expanded; }
}

function handleForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (form.dataset.form === 'coupon') { state.coupon = form.elements.coupon.value.trim().toUpperCase(); return render(); }
  if (form.dataset.form === 'authenticate') {
    const value = form.elements.code.value.trim().toUpperCase();
    const results = { 'AURA-2026-001': ['state-valid', 'Pack verified', 'This demonstration code is accepted. In production, this will return your product’s verification record.'], 'AURA-2026-USED': ['state-invalid', 'This code has already been checked', 'Please contact support if you believe your pack needs another review.'] };
    const [kind, title, text] = results[value] || ['state-invalid', 'Code not found', 'Check the code printed on your pack and try again.'];
    document.querySelector('#auth-result').innerHTML = `<div class="result ${kind}"><strong>${title}</strong><p>${text}</p></div>`;
    return;
  }
  if (form.dataset.form === 'tracking') {
    const order = form.elements.order.value.trim().toUpperCase();
    const email = form.elements.email.value.trim();
    document.querySelector('#tracking-result').innerHTML = order === 'AW-1001' && email ? '<div class="result state-valid"><strong>Order found</strong><p>Your order is confirmed. Courier details and delivery updates will appear here after Shopify tracking is connected.</p></div>' : '<div class="result state-invalid"><strong>No matching order</strong><p>Check the order number and email address, then try again.</p></div>';
    return;
  }
  if (form.dataset.form === 'contact') { document.querySelector('#contact-result').innerHTML = '<div class="result state-valid"><strong>Message received</strong><p>Thanks. The support team will reply to the email address you provided.</p></div>'; return; }
  if (form.dataset.form === 'account') { document.querySelector('#account-result').innerHTML = '<div class="result"><strong>Account sign-in</strong><p>Connect this form to Shopify customer accounts when the store integration is enabled.</p></div>'; return; }
  if (form.dataset.form === 'search') { state.searchQuery = form.elements.query.value.trim(); return form.dataset.mobileSearch ? navigate('search') : render(); }
}

export function start() {
  window.addEventListener('hashchange', render);
  window.addEventListener('pagehide', stopHeroCarousel);
  render();
}
