# Landing Page App-Bar Design

## Problem

The new Nuxt 4 app's `auth.vue` layout (used by the landing page, login, and legal pages) has no app-bar. The old Vue 2 app had a lime-green app-bar on all guest pages with logo, app name, "Blog" link, and "Get Started" button. We need to restore this bar and enhance it with the language switcher and theme toggle that exist in the authenticated layout.

## Approach

Add a `v-app-bar` to `auth.vue` so all guest-facing pages get it. This mirrors the old `App.vue` pattern where the bar was conditionally rendered on non-`showNav` routes.

## App-Bar Elements (left → right)

1. **Logo + App name** — `~/assets/images/logo.png` (55×55px) + app name text. Clickable, navigates to home. Title uses `text-headline-large` on `mdAndUp`, `text-headline-small` on smaller screens.
2. **`v-spacer`** — pushes remaining items right.
3. **"Blog" link** — `v-btn variant="text"`, visible only on `lgAndUp` screens and when not on the blog route. Uses i18n key `nav.blog`. Color: `lime` in dark mode, `secondary` in light.
4. **`LanguageSwitcher`** — reuse existing component from `app/components/LanguageSwitcher.vue`.
5. **Theme toggle** — `v-btn icon` with `mdiWeatherSunny` (when dark) / `mdiWeatherNight` (when light). Persists to `localStorage` key `hepilo-theme`. Same logic as `default.vue`.
6. **"Get Started" button** — `v-btn color="primary"`, links to `/login` via `localePath`. Hidden when current route is login. Uses i18n key `nav.getStarted`.
7. **`v-progress-linear`** — at bottom of app-bar, lime color, tied to `uiStore.saving`.

## Bar Styling

- Uses default Vuetify surface color (theme-aware) — no explicit `:color` binding needed.
- The old lime accent is preserved on the "Blog" button color in dark mode.

## Dependencies

- `LanguageSwitcher` component (already exists)
- `useUIStore` (already exists — `saving` state, notification system)
- `useDisplay` from Vuetify (for `lgAndUp`, `mdAndUp` breakpoints)
- `useTheme` from Vuetify (for theme toggle)
- `@mdi/js` icons: `mdiWeatherSunny`, `mdiWeatherNight`
- i18n keys: `nav.blog`, `nav.getStarted` (both already in en.json and fr.json)
- Logo: `~/assets/images/logo.png` (already exists)
- `useRuntimeConfig` for `appName`

## Theme Persistence

On mount, read `localStorage.getItem('hepilo-theme')` and apply. On toggle, write back. Same pattern as `default.vue`.

## File Changed

- `web/app/layouts/auth.vue` — the only file modified.

## What's NOT Changing

- `default.vue` layout (authenticated pages) — untouched.
- `index.vue` landing page content — untouched.
- No new components created.
- No new i18n keys needed.
