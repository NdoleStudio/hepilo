# Copilot Instructions for Hepilo

## Build, Test, and Lint

All commands run from the `web/` directory. The package manager is **pnpm**.

```sh
pnpm install          # Install dependencies
pnpm dev              # Dev server with hot-reload
pnpm build            # Production build (Nuxt)
pnpm generate         # Static site generation
pnpm test:unit        # Run all unit tests (Vitest)
pnpm test:watch       # Run tests in watch mode
```

Run a single test file:

```sh
pnpm test:unit --testPathPattern="useUtils"
```

There is no separate lint script; rely on your editor's ESLint integration.

### Legacy App (`web-legacy/`)

The legacy Vue 2 app is frozen — do not add features to it. It uses **yarn** and different scripts:

```sh
yarn install && yarn serve   # Dev server
yarn build                   # Production build
yarn test:unit               # Jest tests
yarn lint                    # ESLint
```

## Architecture

Hepilo is a shopping list PWA with two deployments during an ongoing migration:

| | New App (`web/`) | Legacy App (`web-legacy/`) |
|---|---|---|
| **Framework** | Nuxt 4 + Vue 3 | Vue 2 + Vue CLI |
| **UI** | Vuetify 4 (MD3) | Vuetify 2 |
| **State** | Pinia (6 stores) | Vuex (monolithic) |
| **Testing** | Vitest + happy-dom | Jest |
| **Deployment** | Cloudflare Pages | Firebase Hosting |
| **Package Manager** | pnpm | yarn |
| **Node** | 20 | 17 |

**Active development happens in `web/`.** The legacy app at `web-legacy/` is archived.

### Backend & Offline-First Sync

Firebase provides Authentication, Firestore, and App Check (reCAPTCHA v3). State is dual-persisted:

1. **localStorage** — always available, enables offline use
2. **Firestore** (collection `states`, document = user ID) — real-time sync via `onSnapshot()` for authenticated users

All stores write to localStorage after mutations. The list store manages Firestore sync with `setDoc(..., { merge: true })` to avoid overwriting other fields.

### Rendering Strategy

SSR is enabled globally. Route rules in `nuxt.config.ts` fine-tune behavior:

- **Prerendered:** `/`, `/blog/**`, `/privacy-policy`, `/terms-and-conditions`, `/login`, `/demo`
- **CSR only (ssr: false):** `/lists/**`, `/manage/**`, `/settings` (authenticated routes)

### State Management (Pinia)

Six composition-API stores in `web/app/stores/`:

| Store | Purpose |
|-------|---------|
| `auth` | User authentication state, account deletion |
| `list` | Shopping lists, items in lists, cart, Firestore sync (~980 lines, largest store) |
| `item` | Master item registry with units, prices, categories |
| `category` | Item categories with colors; default is `uncategorized` |
| `settings` | Currency preference (auto-detected via ipapi.co), intro flag |
| `ui` | Loading/saving flags, notifications, page title, nav drawer |

Cross-store calls are common — `list.ts` reads from `item`, `category`, `auth`, `settings`, and `ui` stores.

### Domain Model (`web/types/state.ts`)

| Type | Purpose |
|------|---------|
| `List` | Shopping list with `id`, `name`, `icon`, `items: ListItem[]`, `cartPanelOpen` |
| `Item` | Reusable catalog item with `name`, `unit`, `pricePerUnit`, `categoryId` |
| `ListItem` | Instance of an Item in a List (`itemId`, `quantity`, `notes`, `addedToCart`) |
| `Category` | Grouping with `name` and `color`; default is `"uncategorized"` |

Views use `MaterializedList` / `MaterializedListItem` types that join Items with ListItems grouped by Category for rendering.

### Routing & Auth

Nuxt file-based routing with two middleware:

- `auth.ts` — requires Firebase `currentUser`; redirects to `/login`. Client-side only (`import.meta.client` guard).
- `guest.ts` — redirects logged-in users to `/lists`. Client-side only.

Pages apply middleware via `definePageMeta({ middleware: ['auth'] })`.

### Layouts

- `auth.vue` — guest/public pages (home, login, legal). Has app bar with logo, blog link, language switcher, theme toggle.
- `default.vue` — authenticated pages. Has nav drawer with user profile, list navigation, and full app bar.

### i18n

English (default, no prefix) and French (`/fr/` prefix). Locale files in `web/i18n/locales/`. The `@` symbol in translation values must be escaped as `{'@'}` (vue-i18n linked message syntax). HTML in messages requires `strictMessage: false` (already set in nuxt config).

## Key Conventions

### Composition API Everywhere

All stores use `defineStore()` with composition API (setup function). Pages and components use `<script setup lang="ts">`. No Options API or class-based components in the new app.

### Environment Variables

Uses Nuxt runtime config with `NUXT_PUBLIC_*` env vars (not `VUE_APP_*`). Access via `useRuntimeConfig().public`. Key vars: `appName`, `siteUrl`, `siteEmail`, `recaptchaSiteKey`.

### Icons

Uses `@mdi/js` (tree-shakable JS imports), not icon fonts. Import individual icons:

```typescript
import { mdiPencil, mdiDelete } from '@mdi/js'
```

### Composables

Shared logic in `web/app/composables/`:

- `useFirebase` — Firebase Auth instance and `getCurrentUser()` promise
- `useUtils` — platform detection (`isAndroid`, `isMobile`, `isInStandaloneMode`), localStorage helpers
- `useIntl` — currency formatting, currency list (150+ ISO 4217 codes)
- `useConstants` — named route constants (`ROUTE_NAMES`), notification event types
- `useSeoDefaults` — SEO meta tags with i18n support

### Client-Only Code

Guard browser-only code with `import.meta.client`. Plugins that need the browser are suffixed `.client.ts` (e.g., `firebase.client.ts`, `sentry.client.ts`, `clarity.client.ts`).

### Theme

Dark mode is the default. Primary color is `#C6FF00` (lime). Theme toggle persists to localStorage key `hepilo-theme` and reads with an `import.meta.client` guard on mount.

### Tests

Vitest with happy-dom. Test files live in `__tests__/` directories alongside source (e.g., `web/app/composables/__tests__/useUtils.spec.ts`). Naming convention: `*.spec.ts`.

### Firestore Security

Rules in `web/firestore.rules` restrict access so users can only read/write their own `states/{userId}` document.

### Vuetify 4 Notes

Vuetify 4 uses MD3 design tokens. Key differences from Vuetify 2/3:

- Typography: `text-h1`…`text-h6` are replaced by `text-display-large`, `text-headline-small`, `text-title-large`, etc.
- Buttons: `text` → `variant="text"`, `large` → `size="large"`
- Inputs: `outlined` → `variant="outlined"`
- Colors: `lime--text text--darken-2` → `text-lime-darken-2`
