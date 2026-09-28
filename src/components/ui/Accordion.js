import { icon } from './icons.js';

export function Accordion(items, limit = false) {
  const visibleItems = limit ? items.slice(0, 2) : items;
  return `<div class="accordion">${visibleItems.map(([question, answer], index) => `<div><button type="button" data-action="faq-${index}" aria-expanded="false"><span>${question}</span>${icon('chevron')}</button><div class="accordion-panel" hidden>${answer}</div></div>`).join('')}</div>`;
}
