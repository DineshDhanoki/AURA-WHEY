import { links } from '../../data/catalog.js';
import { icon } from '../ui/icons.js';
import { brand, routeLink } from '../ui/render.js';

export function MobileMenu({ route, state }) {
  const nav = links.map(([name, label]) => routeLink(name, label, `nav-link ${name === route ? 'active' : ''}`)).join('');
  return `
    <div class="overlay" data-action="close-menu"></div>
    <aside class="mobile-panel" aria-label="Mobile navigation">
      <div class="mobile-panel-top">${brand()}<button class="icon-button menu-close" type="button" data-action="close-menu" aria-label="Close menu">${icon('close')}</button></div>
      <form class="mobile-search" data-form="search" data-mobile-search="true">
        <label class="sr-only" for="mobile-search-input">Search the store</label>
        <input id="mobile-search-input" name="query" placeholder="Search products and guides" value="${state.searchQuery}" />
        <button type="submit" aria-label="Search">${icon('search')}</button>
      </form>
      <nav>${nav}${routeLink('account', 'Sign in / Log in')}${routeLink('cart', `Cart <span class="cart-count">${state.cart}</span>`)}</nav>
      <div class="mobile-theme"><span>Appearance</span><button type="button" class="text-button" data-action="toggle-theme">${state.theme === 'dark' ? 'Light mode' : 'Dark mode'}</button></div>
    </aside>`;
}
