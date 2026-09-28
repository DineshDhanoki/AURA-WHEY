import { assets } from '../../data/catalog.js';
import { image, routeLink } from '../ui/render.js';

export function PackVerification() {
  return `<section class="section"><div class="section-inner"><div class="section-head"><div><h2>Know your pack</h2><div class="gold-rule"></div></div><p>Read the nutrition panel, check the documents, then verify your product code.</p></div><div class="grid grid-2"><div class="card label-card">${image(assets.labelMawa, 'Aura Whey Mawa Kulfi nutrition label', 'label-preview')}</div><div class="quality-cta"><h3>Quality documents and product authentication</h3><p>Our quality library keeps the supplied certification documents in one place. Use the pack code to confirm your purchase.</p><div class="button-row">${routeLink('quality', 'Open quality library', 'button-link primary')}${routeLink('authenticate', 'Authenticate a pack', 'button-link')}</div></div></div></div></section>`;
}
