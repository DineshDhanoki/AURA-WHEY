---
name: Aura Whey
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d3c5ac'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9c8f79'
  outline-variant: '#4f4633'
  surface-tint: '#f9bd22'
  primary: '#ffe1a7'
  on-primary: '#402d00'
  primary-container: '#fbbf24'
  on-primary-container: '#6c4f00'
  inverse-primary: '#795900'
  secondary: '#ffc23d'
  on-secondary: '#412d00'
  secondary-container: '#e3a600'
  on-secondary-container: '#593f00'
  tertiary: '#78ff96'
  on-tertiary: '#003915'
  tertiary-container: '#4ce378'
  on-tertiary-container: '#006129'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf9f'
  primary-fixed-dim: '#f9bd22'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#ffdea4'
  secondary-fixed-dim: '#fcbc24'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: Montserrat
    fontSize: 56px
    fontWeight: '900'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Montserrat
    fontSize: 36px
    fontWeight: '900'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 32px
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0.03em
  headline-sm:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.04em
  metric-number:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '900'
    lineHeight: 36px
    letterSpacing: '0'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Montserrat
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.12em
  label-spec:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  3xs: 0.125rem
  2xs: 0.25rem
  xs: 0.5rem
  sm: 0.75rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  3xl: 4rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  margin-mobile: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  container-max: 1280px
---

## Brand & Style

The design system establishes a high-performance, unapologetic luxury aesthetic for a premium sports nutrition and wellness brand. Rooted in discipline, physical empowerment, and scientific transparency, the UI balances deep matte obsidian depths with high-octane energetic gold accents.

### Visual Style
- **High-Contrast Dark Elegance:** A pitch-black canvas engineered to make golden calls-to-action, product renders, and nutritional metric badges leap forward with sharp clarity.
- **Performance Precision:** Clean, structured information architecture mirroring lab-tested nutrition panels—clear data grids, bold macro breakdowns, and verified trust seals.
- **Editorial D2C Luxury:** Wide, athletic geometric typography paired with tactile card surfaces, subtle golden ambient halos, and crisp container strokes that reflect professional bodybuilding and athletic lifestyle standards.

## Colors

The color palette is built around an uncompromising dark canvas accented by vivid athletic gold. 

- **Primary (`#FBBF24`):** The signature electric athletic gold used exclusively for primary conversion points, active states, key nutritional callouts, and key visual accents.
- **Secondary (`#E5A800`):** A burnished metallic gold providing depth in gradients, active button press states, and badge borders.
- **Tertiary (`#22C55E`):** A strict regulatory green applied to Indian vegetarian certification indicators and quality validation badges.
- **Neutral Base (`#0B0B0B`):** True matte black foundation that eliminates ambient backlight bleed and maximizes photographic contrast.
- **Surfaces (`#121212`, `#1A1A1A`, `#222222`):** Stepped charcoal tones providing clean visual elevation for product cards, drawer overlays, and nutrition specification matrices without relying on bright backgrounds.

## Typography

The typography strategy leverages two contrasting personalities to achieve athletic energy alongside clinical precision:

- **Headlines & Metrics (`Montserrat`):** Display headers use uppercase weights ranging from 700 to 900. Tight tracking on extra-large banners gives maximum visual punch, while expanded tracking on small labels (`label-caps`) delivers a luxury cosmetic feel.
- **Body & Specs (`Plus Jakarta Sans`):** Clean, geometric, highly legible body copy tuned for low-light legibility. Ideal for reading dense ingredient listings, lab test verifications, and macro breakdowns.
- **Macro Metric Callouts:** Big numbers (`metric-number`) paired with uppercase micro-labels (`label-caps`) ensure the core value propositions (e.g., 24g PROTEIN, 5.7g BCAAs) are scannable in under 500 milliseconds.

## Layout & Spacing

The layout is built around a standard 12-column responsive fluid grid on desktop and tablet, collapsing down to a 4-column structure on mobile devices:

- **Grid Architecture:** 
  - **Desktop (1024px+):** 12 columns, 24px gutters, max container width capped at 1280px to preserve visual impact on ultra-wide screens.
  - **Tablet (768px - 1023px):** 8 columns, 16px gutters, fluid side margins.
  - **Mobile (320px - 767px):** 4 columns, 16px gutters, 16px outer safety margins.
- **Rhythm & Padding:** Component spacing strictly adheres to an 8px rhythm (with a 4px half-step for micro-badges and form controls). Generous vertical section padding (48px mobile, 96px desktop) creates breathable, cinematic storytelling between product hero view, ingredient transparency, and flavor showcases.

## Elevation & Depth

Visual hierarchy on dark surfaces is established through tonal stacking, low-contrast hairline borders, and targeted amber halos rather than diffuse grey drop shadows:

- **Level 0 (Canvas):** Pure `#0B0B0B` matte base.
- **Level 1 (Cards & Modules):** `#121212` with a 1px hairline border in `rgba(255, 255, 255, 0.08)`. Eliminates mud while clearly defining interactive perimeters.
- **Level 2 (Active / Hover / Drawers):** `#1A1A1A` with elevated surface tinting and a delicate perimeter glow: `0 8px 24px -4px rgba(0, 0, 0, 0.7)`.
- **Level 3 (Sticky CTAs & Modals):** `#222222` framed by subtle primary highlights: `0 12px 32px -4px rgba(251, 191, 36, 0.12)`.
- **Athletic Aura Accent:** Hero products and key action elements feature a back-projected radial light gradient (`radial-gradient(circle, rgba(251, 191, 36, 0.15) 0%, transparent 70%)`) representing the glowing energy aura of the brand.

## Shapes

The design uses `roundedness: 2` (base 0.5rem / 8px radius) to balance modern tech sleekness with athletic power:

- **Base Radius (8px / 0.5rem):** Applied to primary buttons, input fields, pill selector pills, and nested badges.
- **Large Radius (16px / 1rem):** Applied to product cards, nutritional info containers, review highlights, and modal dialogues.
- **Extra Large Radius (24px / 1.5rem):** Reserved for floating banners and media spotlight cards.
- **Full Pill Radius (9999px):** Selectively used for category tags, promotional ribbon pills, and flavor indicator capsules.

## Components

### Buttons
- **Primary Action:** Solid athletic gold background (`#FBBF24`) with pure black text (`#0B0B0B`), font `Montserrat` 700 uppercase, 8px border radius. Hover state transitions to `#E5A800` with subtle scale expansion (1.02x) and a soft golden glow (`0 0 20px rgba(251, 191, 36, 0.3)`).
- **Secondary / Outlined:** Transparent background, 1.5px border of `#FBBF24`, white or gold text. On hover, background shifts to `rgba(251, 191, 36, 0.1)`.
- **Tertiary / Ghost:** Pure black surface with muted grey text (`#9CA3AF`), shifting to crisp white on hover.

### Product & Flavor Cards
- Built on `#121212` backgrounds with an 8px or 16px corner radius and 1px border (`rgba(255, 255, 255, 0.08)`).
- Includes an integrated **Macro Badge Bar** across the card footer displaying `24g PROTEIN | 5.7g BCAAs | 28 SERVINGS` in high-contrast gold and white.
- Flavor selection pills feature dedicated iconography or visual swatch cues (e.g., Mawa Kulfi vs. Rich Chocolate).

### Form Controls & Quantity Selectors
- **Input Fields:** Dark charcoal fill (`#1A1A1A`) with `rgba(255, 255, 255, 0.12)` border. On active focus, border turns `#FBBF24` with an inner 1px glow. Text in `#FFFFFF`, placeholder in `#6B7280`.
- **Quantity & Variant Pickers:** Segmented rectangular chips with 8px radius. Active variant has a bold gold border and gold typography; inactive variants use a muted outline with soft grey text.

### Trust Seals & Quality Badges
- Standardized circular and badge containers featuring certified emblems (FSSAI, ISO, GMP, Lab Tested, Vegetarian green dot indicator).
- Badges use dark translucent backdrops (`rgba(255, 255, 255, 0.04)`) with crisp gold or green icon lines to convey regulatory trust and pharmaceutical-grade purity.

### Nutritional Transparency Table
- Styled after certified supplement facts panels: high-contrast alternating charcoal row zebra-striping (`#121212` and `#181818`), crisp dividing lines, and fixed tabular numbering for instant readability of amino acid profiles.