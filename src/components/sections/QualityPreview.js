import { routeLink } from '../ui/render.js';

export function QualityPreview() {
  return `<section class="section"><div class="section-inner"><div class="section-head"><div><h2>Quality, on record</h2><div class="gold-rule"></div></div><p>Review the facility and food-safety documents before you buy.</p></div><div class="trust-grid"><div class="trust-item"><strong>FSSAI licensed</strong><span>Licence no. 10724997000182</span></div><div class="trust-item"><strong>ISO 22000</strong><span>Food safety management system</span></div><div class="trust-item"><strong>GMP</strong><span>Good manufacturing practice</span></div><div class="trust-item"><strong>HACCP</strong><span>Hazard control process</span></div></div><p class="button-row">${routeLink('quality', 'View quality documents', 'button-link secondary')}</p></div></section>`;
}
