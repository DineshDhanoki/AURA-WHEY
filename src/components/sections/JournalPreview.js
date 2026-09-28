import { BlogCard } from '../ui/BlogCard.js';
import { routeLink } from '../ui/render.js';

export function JournalPreview() {
  return `<section class="section"><div class="section-inner"><div class="section-head"><div><h2>Better-informed training</h2><div class="gold-rule"></div></div><p>Practical guides for choosing, using, and enjoying your whey protein.</p></div><div class="grid grid-3">${BlogCard(0)}${BlogCard(1)}${BlogCard(2)}</div><p>${routeLink('blog', 'Browse the journal', 'button-link secondary')}</p></div></section>`;
}
