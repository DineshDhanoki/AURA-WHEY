import { posts } from '../../data/catalog.js';
import { image, routeLink } from './render.js';

export function BlogCard(index) {
  const post = posts[index % posts.length];
  return `<article class="card blog-card"><div class="blog-image">${image(post.image, post.title)}</div><div class="blog-card-copy"><h3>${post.title}</h3><p>${post.excerpt}</p>${routeLink('article', 'Read guide', 'text-link')}</div></article>`;
}
