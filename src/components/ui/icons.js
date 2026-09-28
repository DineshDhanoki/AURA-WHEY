const svg = (paths) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const icon = (name) => ({
  search: svg('<circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path>'),
  account: svg('<circle cx="12" cy="8" r="3.5"></circle><path d="M4.5 20c.9-3.4 3.3-5.2 7.5-5.2s6.6 1.8 7.5 5.2"></path>'),
  bag: svg('<path d="M5.5 8.5h13l-1 11h-11l-1-11Z"></path><path d="M8.5 9V7a3.5 3.5 0 0 1 7 0v2"></path>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"></path>'),
  close: svg('<path d="m6 6 12 12M18 6 6 18"></path>'),
  moon: svg('<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 0 1 0 20.5 14.2Z"></path>'),
  sun: svg('<circle cx="12" cy="12" r="3.5"></circle><path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3"></path>'),
  arrowLeft: svg('<path d="m14.5 5-7 7 7 7"></path>'),
  arrowRight: svg('<path d="m9.5 5 7 7-7 7"></path>'),
  chevron: svg('<path d="m7 10 5 5 5-5"></path>'),
  check: svg('<path d="m5 12 4.2 4.2L19 6.7"></path>'),
  file: svg('<path d="M6 3.5h8l4 4V20.5H6z"></path><path d="M14 3.5v4h4M9 12h6M9 16h6"></path>'),
  instagram: svg('<rect x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="12" cy="12" r="3.5"></circle><path d="M17.5 6.5h.01"></path>'),
  facebook: svg('<path d="M14 21v-8h2.8l.4-3H14V8.1c0-.9.3-1.6 1.7-1.6H17V3.8c-.6-.1-1.3-.2-2.2-.2-2.3 0-3.8 1.4-3.8 4V10H8.5v3H11v8"></path>'),
  linkedin: svg('<path d="M6.5 9.5V18M6.5 6.5v.1M10.5 18v-5.1c0-2.3 4.5-2.5 4.5 0V18M10.5 12.1V9.5M15 12.1V9.5"></path><rect x="3" y="3" width="18" height="18" rx="2"></rect>'),
  youtube: svg('<path d="M20.4 7.1c-.2-1-1-1.8-2-2C16.6 4.7 7.4 4.7 5.6 5.1c-1 .2-1.8 1-2 2-.4 1.8-.4 8 0 9.8.2 1 1 1.8 2 2 1.8.4 11 .4 12.8 0 1-.2 1.8-1 2-2 .4-1.8.4-8 0-9.8Z"></path><path d="m10 9 5 3-5 3Z"></path>')
}[name] || '');
