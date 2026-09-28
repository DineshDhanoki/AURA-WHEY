import { assets, productPrice } from '../../data/catalog.js';
import { button, image } from './render.js';

export function ProductCard(flavour) {
  const isMawa = flavour === 'Mawa Kulfi';
  const description = isMawa ? 'A creamy, kulfi-inspired finish with a familiar Indian flavour profile.' : 'A deep chocolate flavour made for a classic shake routine.';
  return `<article class="card product-card"><div class="product-card-media">${image(isMawa ? assets.mawa : assets.chocolate, `Aura Whey ${flavour}`)}</div><div class="product-card-body"><div class="product-card-top"><h3>Aura Whey <span>${flavour}</span></h3><strong>${productPrice}</strong></div><div class="product-meta"><span>1 kg</span><span>28 servings</span></div><p>${description}</p><div class="product-card-macros"><span><b>24g</b> Protein</span><span><b>5.7g</b> BCAAs</span><span><b>28</b> Servings</span></div><div class="button-row">${button(`select-${flavour}`, 'View product', 'primary')}</div></div></article>`;
}
