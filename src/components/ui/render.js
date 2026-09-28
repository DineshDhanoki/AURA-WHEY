import { icon } from './icons.js';

export const routeLink = (route, label, className = '') => `<a href="#/${route}" class="${className}" data-route="${route}">${label}</a>`;
export const iconLink = (route, name, label, className = '') => routeLink(route, `${icon(name)}<span class="sr-only">${label}</span>`, `icon-button ${className}`);
export const button = (action, label, className = '', iconName = '') => `<button type="button" class="button ${className}" data-action="${action}">${iconName ? icon(iconName) : ''}<span>${label}</span></button>`;
export const image = (src, alt, className = '') => `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" />`;

export function brand() {
  return routeLink('home', '<span class="brand-mark" aria-hidden="true"><i>A</i><b>V</b></span><span class="brand-name">AURA <strong>WHEY</strong><small>Fuel your aura</small></span>', 'brand');
}
