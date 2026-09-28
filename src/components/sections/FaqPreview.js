import { faqs } from '../../data/catalog.js';
import { Accordion } from '../ui/Accordion.js';
import { routeLink } from '../ui/render.js';

export function FaqPreview() {
  return `<section class="section"><div class="section-inner"><div class="section-head"><div><h2>Before you order</h2><div class="gold-rule"></div></div><p>The quick answers customers look for most.</p></div>${Accordion(faqs, true)}<p>${routeLink('faq', 'Read all FAQs', 'button-link secondary')}</p></div></section>`;
}
