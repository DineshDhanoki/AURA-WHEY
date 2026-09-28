import { assets } from '../../data/catalog.js';
import { image } from '../ui/render.js';

export function RoutineSection() {
  return `<section class="section"><div class="section-inner"><div class="section-head"><div><h2>Made for the routine</h2><div class="gold-rule"></div></div><p>Simple product details. Familiar flavours. A dependable post-training choice.</p></div><div class="image-section">${image(assets.why, 'Aura Whey product and key details')}</div></div></section>`;
}
