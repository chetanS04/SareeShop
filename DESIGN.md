# SVastra — DESIGN.md

Canonical design system for all SVastra marketing / customer storefront work.
Admin dashboard may keep separate chrome; storefront must follow this document.

## Brand Philosophy: "Wear Yourself"

**Target:** The confident, ambitious contemporary Indian woman moving fluidly between multiple identities and moods.

**Brand Tension:** Indian but not stereotypical · Feminine but not delicate · Bold but not loud · Modern without losing its roots.

---

## 1. Visual Style

- **Editorial luxury:** High-fashion publication feel, generous whitespace, sharp lines, tactile paper-like backgrounds.
- **Architectural & restrained:** Clean 1px structural dividers, **zero drop-shadows**, **border-radius 0–2px** (no pills/bubbles except avatars).
- **Subtle cultural heritage:** Contemporary Indian confidence — avoid ethnic clichés, bridal tropes, ornamental filigree.
- **Selective expression:** High-contrast type moments, bold graphic badges, curated mood capsules.

---

## 2. Color System

### Primary foundation

| Token | Hex | Use |
|-------|-----|-----|
| Indian Red (primary) | `#8B1313` | CTAs, hero badges, campaign highlights, active states |
| Noir Black | `#0E0E0D` | Headlines, structural lines, secondary actions |
| Deep Slate | `#4A4742` | Body secondary, metadata, captions |
| Warm Ivory | `#F1E5D2` | Secondary surfaces, editorial panels |
| Canvas Cream | `#FFF8F2` | Global background canvas |
| Pure White | `#FFFFFF` | Product card containers, modals |

### Curated accents (selective only — never compete with primary/noir)

| Token | Hex | Use |
|-------|-----|-----|
| Mustard / Haldi Ochre | `#D19E3D` | Craft callouts, collection markers |
| Deep Magenta | `#951F4B` | Evening / capsule badges |
| Royal Blue | `#1D3170` | Tailored / formal cues |

### Forbidden on marketing

- Zelton blue `#007FFF`, SaaS purple/indigo, bright success green `#0CCA4A`, soft gray SaaS cards, multi-layer shadows, rounded-full pills (except avatars).

### Borders

- Light: `rgba(14, 14, 13, 0.08)`–`0.12`
- On dark: `rgba(255, 248, 242, 0.14)`

---

## 3. Typography

**Font:** Inter, system-ui, sans-serif. Optional Playfair Display for editorial quotes only.

| Role | Size | LH | Tracking | Weight |
|------|------|----|----------|--------|
| Display / Hero | 56–72px (fluid clamp OK) | 1.08 | -0.03em | 700 |
| H1 | 40–48px | 1.15 | -0.025em | 700 |
| H2 | 28–34px | 1.2 | -0.02em | 600–700 |
| H3 / Card title | 20–24px | 1.3 | -0.01em | 600 |
| Body large / quotes | 18px | 1.6 | normal | 400 |
| Body | 15–16px | 1.55 | normal | 400 |
| Caption | 13–14px | 1.5 | +0.01em | 400 · `#4A4742` |
| Button labels | 12–13px | — | +0.06em | 600 · UPPERCASE |
| Eyebrow / labels | 11–12px | — | +0.08em | 600 · UPPERCASE |

---

## 4. Layout & Spacing

- **Max width:** 1440px (`max-w-site`)
- **Desktop pad:** 80–96px outer (or `site-pad` clamp)
- **8pt scale:** 4 / 8 / 16 / 24 / 32 / 48 / 64 / 96–128px section breaks

---

## 5. Components

### Buttons

- Radius: **0**
- Primary: `#8B1313` fill, cream/white uppercase type; hover → `#0E0E0D`
- Ghost: 1px `#0E0E0D` border; hover fill noir + cream text
- Padding ~16×32px

### Product cards

- Aspect **3:4** or **4:5**
- Container: `#FFFFFF` or cream, **no box-shadow**, 1px border or edge-to-edge image
- Stack: uppercase slug `#4A4742` → bold title `#0E0E0D` → price regular/bold
- Hover: restrained (no layout jump)

### Nav

- Logo mark + **SVASTRA** wordmark (or wordmark asset)
- Uppercase nav links, hairline bottom border
- Icons: search, profile, wishlist, bag

### Assets

| Asset | Path |
|-------|------|
| Logo mark | `/svastra/logo-mark.png` (prefer official *SVastra Logo Mark.png*) |
| Wordmark | `/svastra/word-mark.png` when available |
| Campaign | `/svastra/campaign/` when available |

---

## 6. Implementation map (Next.js)

- Tokens & utilities: `next-app/src/app/globals.css` (`.sv-theme`)
- Marketing shell: `src/app/(marketing)/layout.tsx`
- Chrome: `Navbar.tsx`, `Footer.tsx`
- Home sections: `src/components/(frontend)/svastra/*`
- Product card: `ProductCard.tsx`

**Rule:** Any new marketing UI must use only the palette and geometry above.
