# Switch Application Font from Inter to Manrope

## Problem

The app currently uses the Inter font loaded via `@nuxtjs/google-fonts`. We want to switch to Manrope and use the newer `@nuxt/fonts` module, which provides better font optimization (automatic fallback generation, font metric overrides to reduce CLS).

## Approach

Replace `@nuxtjs/google-fonts` with `@nuxt/fonts`, explicitly configure Manrope with weights 300–700, and update all font references across Vuetify config and global styles.

## Changes

### 1. Dependencies (`package.json`)

- **Remove:** `@nuxtjs/google-fonts`
- **Install:** `@nuxt/fonts`

### 2. Nuxt Configuration (`nuxt.config.ts`)

- Replace `'@nuxtjs/google-fonts'` with `'@nuxt/fonts'` in the `modules` array
- Remove the `googleFonts` config block
- Add `fonts` config block with explicit Manrope family (weights 300, 400, 500, 600, 700, provider: google)
- Update `vuetify.vuetifyOptions.defaults.global.font.family` from `'Inter'` to `'Manrope'`

### 3. Global Styles (`app/assets/styles/global.scss`)

- Change `font-family: 'Inter', sans-serif` → `font-family: 'Manrope', sans-serif`

## Out of Scope

- No layout or component changes
- No SASS variable overrides for Vuetify's `$body-font-family` (the `defaults.global.font` approach is already in use and sufficient)
- No changes to the legacy app (`web-legacy/`)

## Verification

- `pnpm build` succeeds
- Dev server renders text in Manrope (verify via browser DevTools → Computed font)
- No references to Inter remain in config files
