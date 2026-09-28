import { heroSlides } from '../../data/hero-slides.js';
import { icon } from '../ui/icons.js';
import { HeroSlide } from './HeroSlide.js';

let timer = null;

export function HeroCarousel(activeIndex) {
  return `
    <section class="hero-carousel" id="hero-carousel" aria-label="Featured promotions" role="region">
      <div class="hero-slides-track">${heroSlides.map((slide, index) => HeroSlide(slide, index, activeIndex)).join('')}</div>
      <button type="button" class="hero-ctrl-btn prev" data-action="hero-prev" aria-label="Previous slide">${icon('arrowLeft')}</button>
      <button type="button" class="hero-ctrl-btn next" data-action="hero-next" aria-label="Next slide">${icon('arrowRight')}</button>
      <div class="hero-indicators" role="tablist" aria-label="Hero slide navigation">
        ${heroSlides.map((slide, index) => `<button type="button" class="hero-indicator ${index === activeIndex ? 'is-active' : ''}" data-action="hero-${index}" role="tab" aria-selected="${index === activeIndex}" aria-label="Go to slide ${index + 1}: ${slide.title}"></button>`).join('')}
      </div>
    </section>`;
}

export function stopHeroCarousel() {
  if (timer) clearInterval(timer);
  timer = null;
}

export function initHeroCarousel({ getIndex, setIndex, isHome }) {
  const carousel = document.querySelector('#hero-carousel');
  if (!carousel || !isHome() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stopHeroCarousel();
    return;
  }

  const start = () => {
    stopHeroCarousel();
    timer = setInterval(() => setIndex(getIndex() + 1), 5000);
  };

  carousel.onmouseenter = stopHeroCarousel;
  carousel.onmouseleave = start;

  let startX = 0;
  let startY = 0;
  carousel.ontouchstart = (event) => {
    startX = event.changedTouches[0].screenX;
    startY = event.changedTouches[0].screenY;
  };
  carousel.ontouchend = (event) => {
    const diffX = event.changedTouches[0].screenX - startX;
    const diffY = event.changedTouches[0].screenY - startY;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) setIndex(getIndex() + (diffX < 0 ? 1 : -1));
  };

  start();
}
