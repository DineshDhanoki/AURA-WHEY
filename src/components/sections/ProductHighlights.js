import { ProductCard } from '../ui/ProductCard.js';

export function ProductHighlights() {
  return `<section class="section"><div class="section-inner"><div class="section-head"><div><h2>Pick your flavour</h2><div class="gold-rule"></div></div><p>Choose the flavour that fits the ritual you want to repeat.</p></div><div class="grid grid-2">${ProductCard('Mawa Kulfi')}${ProductCard('Rich Chocolate')}</div></div></section>`;
}
