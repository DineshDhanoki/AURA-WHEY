# Aura Whey frontend structure

The storefront remains a vanilla JavaScript hash-routed SPA. The entry point is intentionally small; visual sections, reusable markup, page content, and static data now live in focused modules.

```text
.
|-- index.html                         # Static document shell
|-- app.js                             # Browser module bridge
|-- styles.css                         # Existing global visual system
|-- src/
|   |-- main.js                        # Starts the application
|   |-- app.js                         # Root composition and event delegation
|   |-- components/
|   |   |-- hero/
|   |   |   |-- HeroCarousel.js        # Autoplay, arrows, dots, swipe, motion preference
|   |   |   `-- HeroSlide.js           # One responsive hero banner
|   |   |-- layout/
|   |   |   |-- Header.js
|   |   |   |-- MobileMenu.js
|   |   |   `-- Footer.js
|   |   |-- sections/
|   |   |   |-- ProductHighlights.js
|   |   |   |-- NutritionSnapshot.js
|   |   |   |-- RoutineSection.js
|   |   |   |-- QualityPreview.js
|   |   |   |-- PackVerification.js
|   |   |   |-- JournalPreview.js
|   |   |   `-- FaqPreview.js
|   |   `-- ui/
|   |       |-- Accordion.js
|   |       |-- BlogCard.js
|   |       |-- CouponForm.js
|   |       |-- ProductCard.js
|   |       |-- icons.js
|   |       `-- render.js
|   |-- data/
|   |   |-- catalog.js                 # Products, links, documents, FAQs, journal data
|   |   `-- hero-slides.js             # Replace hero artwork here only
|   |-- pages/
|   |   |-- HomePage.js
|   |   `-- StorePages.js               # Remaining route page renderers
|   |-- routes/
|   |   `-- router.js                  # Hash route parsing and navigation
|   `-- state/
|       `-- store.js                   # Cart, coupon, theme, selection state
`-- docs/
    `-- FRONTEND_STRUCTURE.md
```

## Module ownership

| Area | Responsibility |
| --- | --- |
| `src/app.js` | Application shell, route selection, and delegated interaction handlers. |
| `components/layout` | Shared header, mobile navigation, and footer markup. |
| `components/hero` | Responsive carousel behavior independent of content. |
| `components/sections` | Homepage sections, kept in their existing visual order. |
| `components/ui` | Reusable cards, controls, icons, and markup helpers. |
| `data` | Static storefront content. Update `hero-slides.js` to swap banner artwork. |
| `pages` | Page-level composition for each existing hash route. |
| `state` and `routes` | Existing storefront state and URL behavior. |

## Refactor invariants

- Existing design, styles, copy, routes, and customer flows remain intact.
- `app.js` stays a thin bootstrap; `src/app.js` does not contain page or section markup.
- Hero images use the slide data file, with `mobileImage` falling back to `desktopImage`.
- No framework or build tool was introduced.
