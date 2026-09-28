export function HeroSlide(slide, index, activeIndex) {
  const isActive = index === activeIndex;
  return `
    <div class="hero-slide ${isActive ? 'is-active' : ''}" data-slide-index="${index}" role="group" aria-roledescription="slide" aria-label="${slide.title}" aria-hidden="${!isActive}">
      <a href="${slide.link || '#/shop'}" class="hero-slide-link" tabindex="${isActive ? '0' : '-1'}">
        <picture class="hero-picture">
          ${slide.mobileImage ? `<source media="(max-width: 768px)" srcset="${slide.mobileImage}">` : ''}
          <img class="hero-banner-img" src="${slide.desktopImage}" alt="${slide.alt || slide.title}" loading="${index === 0 ? 'eager' : 'lazy'}" />
        </picture>
      </a>
    </div>`;
}
