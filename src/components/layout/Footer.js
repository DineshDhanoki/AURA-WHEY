import { icon } from '../ui/icons.js';
import { brand, routeLink } from '../ui/render.js';

export function Footer() {
  return `<footer class="footer"><div class="footer-grid">
    <div class="footer-intro">${brand()}<p>Whey protein in Mawa Kulfi and Rich Chocolate flavours. Built around the routine, not the noise.</p></div>
    <div><strong>Shop</strong><ul><li>${routeLink('shop', 'Whey protein')}</li><li>${routeLink('cart', 'Your cart')}</li></ul></div>
    <div><strong>Support</strong><ul><li>${routeLink('authenticate', 'Authenticate a pack')}</li><li>${routeLink('track-order', 'Track your order')}</li><li>${routeLink('faq', 'FAQs')}</li><li>${routeLink('contact', 'Contact')}</li></ul></div>
    <div><strong>Learn</strong><ul><li>${routeLink('quality', 'Quality & lab reports')}</li><li>${routeLink('blog', 'Journal')}</li><li>${routeLink('policy', 'Policies')}</li></ul></div>
  </div><div class="footer-bottom"><div class="footer-socials" aria-label="Social links"><a href="#" aria-label="Facebook">${icon('facebook')}</a><a href="#" aria-label="Instagram">${icon('instagram')}</a><a href="#" aria-label="LinkedIn">${icon('linkedin')}</a><a href="#" aria-label="YouTube">${icon('youtube')}</a></div><span>© 2026 Aura Whey</span></div></footer>`;
}
