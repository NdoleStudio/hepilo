# Auth Layout Footer Enhancement

## Problem

The auth layout footer currently only shows Blog, Privacy Policy, and Terms links. It needs social media icon buttons (GitHub, X, Bluesky) with brand-color hover effects, MIT license text, and a copyright notice linking to Ndole Studio.

## Approach

Enhance the existing `v-footer` in `auth.vue` by adding new rows above the existing links. Use `simple-icons` for brand SVG paths and colors. Use Vuetify theme awareness for dark/light mode color switching.

## Changes

### 1. Dependencies (`package.json`)

- **Install:** `simple-icons` — provides tree-shakable brand SVG paths and hex colors

### 2. Footer Template (`app/layouts/auth.vue`)

Restructure the `v-footer` into a vertical column layout with 4 rows:

```
Row 1: [GitHub] [X] [Bluesky]           ← v-btn icon, variant="text"
Row 2: "Released under the MIT License"  ← text-body-small, text-medium-emphasis
Row 3: "Copyright © 2023-2026 Ndole Studio LLC"  ← text-body-small, "Ndole Studio LLC" linked
Row 4: Blog | Privacy Policy | Terms     ← existing links (unchanged)
```

**Icon buttons:**
- Use `v-btn` with `icon`, `variant="text"`, `size="small"`
- Default color: `text-medium-emphasis` (matches existing footer aesthetic)
- Hover: brand color applied via scoped CSS class
- Each button wraps an SVG `<path>` from `simple-icons` inside a `<v-icon>` using the SVG path string
- All links open in new tab (`target="_blank"`, `rel="noopener noreferrer"`)

**External links:**
| Icon | URL |
|------|-----|
| GitHub | `https://github.com/NdoleStudio/hepilo` |
| X | `https://x.com/intent/follow?screen_name=hepilohq` |
| Bluesky | `https://bsky.app/profile/arnold.cm` |

**Copyright link:**
- "Ndole Studio LLC" links to `https://ndole.studio`

### 3. Brand Color Hover Logic

| Brand | Light Mode Hover | Dark Mode Hover |
|-------|-----------------|-----------------|
| GitHub | `#181717` | `#ffffff` |
| X | `#000000` | `#ffffff` |
| Bluesky | `#0085FF` | `#0085FF` |

Use Vuetify's `useTheme()` (already imported in auth.vue) and `isDark` computed (already exists) to pick the correct hover color per brand. Apply via scoped CSS with `--brand-color` custom properties on each button.

### 4. i18n Keys

Add to both `en.json` and `fr.json` under the `home` namespace:

**English:**
```json
"footerMitLicense": "Released under the MIT License",
"footerCopyright": "Copyright © 2023-2026"
```

**French:**
```json
"footerMitLicense": "Publié sous la licence MIT",
"footerCopyright": "Copyright © 2023-2026"
```

"Ndole Studio LLC" is a proper noun and not translated.

### 5. Script Changes (`auth.vue`)

- Import `siGithub`, `siX`, `siBluesky` from `simple-icons/icons`
- Define brand data (path, url, hover colors) as a reactive structure
- No new composables needed — all logic stays in `auth.vue`

## Out of Scope

- No changes to the `default.vue` layout footer
- No changes to existing footer link behavior
- No changes to other pages or components

## Verification

- `pnpm build` succeeds
- Footer displays correctly in both light and dark modes
- Icon buttons show brand color on hover
- All external links open in new tabs
- i18n works for both en and fr
