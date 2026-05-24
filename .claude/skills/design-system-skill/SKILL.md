---
name: design-system-skill
description: Detailed UI design-system guidance for FIFA World Cup 26-inspired interfaces. Use when designing or implementing product UI that should follow FWC26 visual language, including color tokens, typography, layout, components, accessibility, and motion.
license: MIT
metadata:
  author: mundIAl
  version: "1.0.0"
---

# FWC26 Design System Skill

Build a production-ready UI design system aligned to FIFA World Cup 26 visual language while keeping implementation legal, accessible, and scalable.

## Source Of Truth

Use references in `references/fwc26-brand-research.md`.

Treat these as canonical constraints:

- Official tournament display typeface is `FWC 26` / `FWC 2026` (proprietary).
- Supporting sans family includes `Noto Sans`.
- Core tournament mark language is neutral (black, white, gold) plus adaptable host/city color variants.

## Legal And Brand Guardrails

- Do not claim official affiliation unless the user explicitly has rights-holder status.
- Do not generate fake FIFA lockups, altered official emblems, or partner-style badges.
- For non-rights-holder work, keep visual inspiration at system level: palette behavior, typography tone, geometry, motion rhythm.

## Design Principles

- Build from a neutral backbone first, then layer context accents.
- Keep trophy-gold as prestige highlight, not as default body color.
- Prefer bold, compact display moments and clean readable body text.
- Support multilingual content and long labels by default.
- Keep components modular so city or match themes can swap accents without layout breakage.

## Color System

Use this token architecture.

### 1) Core Tournament Neutrals

Extracted from official FIFA World Cup 26 IP Guidelines artwork (June 2024) and its emblem examples.

- `--fwc26-black: #000000`
- `--fwc26-white: #FFFFFF`
- `--fwc26-gold-700: #A06820`
- `--fwc26-gold-600: #B88030`
- `--fwc26-gold-500: #C89038`
- `--fwc26-gold-400: #D0A050`

Use cases:

- `black/white` for structure, text, and negative space.
- `gold-*` for premium highlights: keylines, active chips, metric callouts, CTA emphasis.

### 2) Adaptive Accent Families

Derived from official host/city example marks shown in FIFA guidelines pages with colorful variants.

Family A (sunset):

- `--fwc26-accent-a-500: #F01860`
- `--fwc26-accent-a-400: #F06090`
- `--fwc26-accent-a-300: #F07038`

Family B (violet-green):

- `--fwc26-accent-b-500: #8848F0`
- `--fwc26-accent-b-400: #8050E8`
- `--fwc26-accent-b-300: #087020`

Family C (electric blue-magenta):

- `--fwc26-accent-c-500: #2048F0`
- `--fwc26-accent-c-400: #1848E8`
- `--fwc26-accent-c-300: #8818A0`

Use one accent family per experience surface (city page, match card set, campaign section). Do not mix all families in the same component cluster.

### 3) Semantic Tokens

Map raw palette tokens into product semantics:

- `--color-bg: var(--fwc26-white)`
- `--color-fg: var(--fwc26-black)`
- `--color-primary: var(--fwc26-black)`
- `--color-primary-contrast: var(--fwc26-white)`
- `--color-premium: var(--fwc26-gold-500)`
- `--color-accent: var(--fwc26-accent-a-500)`
- `--color-border: color-mix(in srgb, var(--fwc26-black) 16%, var(--fwc26-white))`
- `--color-muted: color-mix(in srgb, var(--fwc26-black) 56%, var(--fwc26-white))`

## Typography System

### Font Roles

- Display: `FWC 2026` (official custom typeface, rights-managed)
- UI/Text: `Noto Sans`

Fallback strategy when `FWC 2026` is unavailable:

- Display fallback stack: `"Noto Sans", "Arial Narrow", "Helvetica Neue", Arial, sans-serif`
- Body stack: `"Noto Sans", "Helvetica Neue", Arial, sans-serif`

### Type Scale

Use a compact, high-impact scale:

- `display-xl`: 80/0.95/700
- `display-lg`: 64/0.95/700
- `display-md`: 48/1.0/700
- `h1`: 36/1.05/700
- `h2`: 28/1.1/700
- `h3`: 22/1.2/600
- `body-lg`: 18/1.5/500
- `body`: 16/1.5/400
- `body-sm`: 14/1.45/400
- `caption`: 12/1.4/500

(Format: `font-size/line-height/font-weight`)

### Typographic Rules

- Uppercase display text sparingly for scoreboard-like UI.
- Keep paragraph copy in sentence case for readability.
- Minimum body size: `16px` desktop, `15px` mobile.
- Prefer optical alignment over strict geometric centering for large numerals.

## Spacing, Radius, And Grid

Use an 8px base grid:

- Spacing scale: `4, 8, 12, 16, 24, 32, 40, 48, 64, 80`
- Radius scale: `6, 10, 14, 20`
- Border widths: `1px`, `2px`, `3px` only

Layout:

- Max content width: `1280px`
- Desktop columns: `12`
- Tablet columns: `8`
- Mobile columns: `4`
- Default gutters: `24px desktop`, `16px mobile`

## Component Language

### Buttons

- Primary: black fill, white label, optional gold focus ring.
- Secondary: white fill, black border/text.
- Accent: accent-family fill with black text if contrast passes AA; else white text.

### Cards

- Neutral base card with strong typography.
- Use a single accent edge or corner block, not full-bleed gradients by default.
- Match cards should prioritize hierarchy: teams, time, venue, broadcast.

### Tags And Chips

- Tournament-state chips: neutral (`Upcoming`, `Live`, `Final`).
- City/theme chips: one accent family only.

### Navigation

- High-contrast top nav.
- Active item indicated by gold underline or block marker.

### Data Display

- Score numerals may use display role.
- Stats tables remain plain and neutral; use accent only for deltas or selected rows.

## Motion System

- Duration tokens: `120ms`, `180ms`, `260ms`, `420ms`
- Easing tokens: `standard`, `accelerate`, `decelerate`
- Stagger reveal for lists/cards: `20-40ms` offsets
- Avoid continuous decorative animation in data-heavy screens.

## Accessibility Baseline

- Target WCAG 2.2 AA minimum.
- Verify contrast for every accent-state pair.
- Focus state must be visible without color-only cues.
- Respect reduced-motion preferences.
- Preserve semantic heading order and landmark roles.

## Implementation Blueprint

### CSS Tokens

```css
:root {
  --fwc26-black: #000000;
  --fwc26-white: #ffffff;
  --fwc26-gold-700: #a06820;
  --fwc26-gold-600: #b88030;
  --fwc26-gold-500: #c89038;
  --fwc26-gold-400: #d0a050;

  --fwc26-accent-a-500: #f01860;
  --fwc26-accent-a-400: #f06090;
  --fwc26-accent-a-300: #f07038;

  --fwc26-accent-b-500: #8848f0;
  --fwc26-accent-b-400: #8050e8;
  --fwc26-accent-b-300: #087020;

  --fwc26-accent-c-500: #2048f0;
  --fwc26-accent-c-400: #1848e8;
  --fwc26-accent-c-300: #8818a0;
}
```

### Tailwind Theme Mapping

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        fwc26: {
          black: "#000000",
          white: "#FFFFFF",
          gold: {
            700: "#A06820",
            600: "#B88030",
            500: "#C89038",
            400: "#D0A050"
          },
          accent: {
            a: {500: "#F01860", 400: "#F06090", 300: "#F07038"},
            b: {500: "#8848F0", 400: "#8050E8", 300: "#087020"},
            c: {500: "#2048F0", 400: "#1848E8", 300: "#8818A0"}
          }
        }
      },
      fontFamily: {
        display: ['"FWC 2026"', '"Noto Sans"', '"Arial Narrow"', 'sans-serif'],
        sans: ['"Noto Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif']
      }
    }
  }
}
```

## Workflow For This Skill

1. Confirm rights context: official vs inspired implementation.
2. Choose one accent family per page/flow.
3. Apply neutral backbone and typography roles first.
4. Build components with semantic tokens, not raw hex.
5. Run contrast and responsive checks.
6. Export a token table and component usage examples with every delivery.
