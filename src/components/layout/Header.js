import { links } from '../../data/catalog.js';
import { icon } from '../ui/icons.js';
import { brand, iconLink, routeLink } from '../ui/render.js';

export function Header({ route, state }) {
  const nav = links.map(([name, label]) => routeLink(name, label, `nav-link ${name === route ? 'active' : ''}`)).join('');
  const themeLabel = state.theme === 'dark' ? 'Use light mode' : 'Use dark mode';
  const themeIcon = state.theme === 'dark' ? 'sun' : 'moon';
  return `
    <header class="site-header">
      <div class="coupon-wrap" role="region" aria-label="Special offers">
        <div class="coupon-ticker-track" data-action="apply-coupon" title="Click to apply code DISC5">
          <div class="coupon-ticker-content">
            <span class="ticker-item"><span class="ticker-pill">Offer</span> Use coupon code <strong class="ticker-code">DISC5</strong> to get 5% off on all orders</span><span class="ticker-dot">•</span>
            <span class="ticker-item">Free express delivery across India over ₹999</span><span class="ticker-dot">•</span>
            <span class="ticker-item">100% genuine & lab tested</span><span class="ticker-dot">•</span>
            <span class="ticker-item">Cash on delivery available</span><span class="ticker-dot">•</span>
            <span class="ticker-item"><span class="ticker-pill">Offer</span> Use coupon code <strong class="ticker-code">DISC5</strong> to get 5% off on all orders</span><span class="ticker-dot">•</span>
            <span class="ticker-item">Free express delivery across India over ₹999</span><span class="ticker-dot">•</span>
            <span class="ticker-item">100% genuine & lab tested</span><span class="ticker-dot">•</span>
            <span class="ticker-item">Cash on delivery available</span>
          </div>
        </div>
      </div>
      <div class="header"><div class="header-inner">
        ${brand()}
        <nav class="desktop-nav" aria-label="Primary navigation">${nav}</nav>
        <div class="header-actions">
          ${iconLink('search', 'search', 'Search', 'hide-mobile')}
          ${iconLink('account', 'account', 'Sign in or log in')}
          ${routeLink('cart', `${icon('bag')}<span class="cart-count" aria-label="${state.cart} items in cart">${state.cart}</span><span class="sr-only">Cart</span>`, 'icon-button cart-link')}
          <button class="icon-button theme-toggle" type="button" data-action="toggle-theme" aria-label="${themeLabel}" title="${themeLabel}">${icon(themeIcon)}</button>
          <button class="icon-button menu-button" type="button" data-action="open-menu" aria-label="Open menu" aria-expanded="false">${icon('menu')}</button>
        </div>
      </div></div>
    </header>`;
}
