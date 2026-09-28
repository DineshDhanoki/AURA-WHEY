# Performance changes and verification

Preview: `npm run dev -- 8010`, then open `http://localhost:8010/`.
Add `?perf=1` to a page for development-only performance observations. Results
are available in the HTML element's `data-performance` attribute. The probe is
not included in the production HTML.

## Changes

- Commerce initialization updates product and cart UI without replacing the
  hero, gallery, header, or reviews. Account initialization only rerenders the
  account page. Product and saved-cart requests run concurrently.
- Non-shopping routes defer commerce initialization until needed.
- The first homepage hero image is preloaded from the document head. Only the
  active and next carousel images receive sources initially. Transitions wait
  for decoding; autoplay pauses offscreen, in hidden tabs, and for reduced motion.
- Product images have 160px and 640px variants; thumbnail slots request 88px.
  The zoom viewer still uses the full original. Cart images request 240px from Shopify.
- The full-size hero blur was removed and mobile fixed controls avoid backdrop blur.
- Production scripts and styles have content-hashed filenames and immutable
  caching. Images have a one-day browser cache with stale-while-revalidate.
  Run the build before deploying the dist directory.

## Measured checks

Chrome on the development Mac at 390 x 844, local server, no CPU/network throttling:

| Page | LCP | CLS | Long tasks | Frame intervals over 34ms |
| --- | --- | --- | --- | --- |
| Homepage, first measured sample | 436ms | 0 | 1 (81ms) | 3 / 702 in 12s |
| Product, repeat load | 72ms | 0.045 | 0 | 0 / 721 in 12s |

These are individual local samples, not production Core Web Vitals, a controlled
before/after comparison, or physical-phone FPS results. Frame intervals measure
requestAnimationFrame scheduling, not confirmed GPU-presented frames. Repeat-load
results benefit from cache. No real-user INP result was collected.

Five Mawa Kulfi thumbnail files total 49,594 bytes versus 607,082 bytes for the
original gallery files; Rich Chocolate totals 49,341 versus 638,556 bytes. This
is a 92% reduction for thumbnail-sized requests, not the whole page payload.

Verified mobile and desktop homepage rendering, no horizontal overflow, staged
hero loading, gallery switching, add-to-cart, quantity updates, and resized cart
images. All 48 Node tests passed. Account authentication and shipping APIs require
the deployed server environment; the local static preview returns a signed-out
account session. No checkout was submitted.
