# Copilot Instructions for Hepilo

## Build, Test, and Lint

All commands run from the `web/` directory. The package manager is **yarn**.

```sh
yarn install          # Install dependencies
yarn serve            # Dev server with hot-reload
yarn build            # Production build
yarn test:unit        # Run all unit tests
yarn lint             # Lint and auto-fix
```

Run a single test file:

```sh
yarn test:unit --testPathPattern="utils.spec"
```

## Architecture

Hepilo is a Vue 2 shopping list PWA deployed to Firebase Hosting with Firestore as the backend.

- **Framework:** Vue 2 with TypeScript, Vuetify 2 for UI, Vue Router, Vuex for state
- **Backend:** Firebase (Authentication, Firestore, App Check with ReCAPTCHA v3)
- **Blog:** Content fetched from the Notion API at build/runtime
- **Monitoring:** Sentry for error tracking and performance tracing
- **PWA:** Service worker for offline support; also published as an Android TWA on Google Play

### State Management

A single monolithic Vuex store (`web/src/store/index.ts`) — no modules. State is dual-persisted:

1. **localStorage** (key `"states"`) — always available, enables offline use
2. **Firestore** (collection `"states"`, document = user ID) — synced in real-time via `onSnapshot()` for authenticated users

The store merges remote changes from Firestore into local state automatically.

### Domain Model (`web/src/types/state.ts`)

| Type | Purpose |
|------|---------|
| `List` | Shopping list with `id`, `name`, `icon`, `items: ListItem[]` |
| `Item` | Reusable catalog item with `name`, `unit`, `pricePerUnit`, `categoryId` |
| `ListItem` | Instance of an Item in a List (`itemId`, `quantity`, `notes`, `addedToCart`) |
| `Category` | Grouping with `name` and `color`; default is `"uncategorized"` |

Views use `MaterializedList` / `MaterializedListItem` types that join Items with ListItems grouped by Category for rendering.

### Routing & Auth

Routes are defined in `web/src/router/index.ts`. Auth is enforced via `beforeEach` guard checking route meta:

- `meta.auth: true` — requires Firebase authentication; redirects to `/login`
- `meta.guest: true` — guest-only (home page); authenticated users redirect to `/lists`
- `meta.showNav: true` — shows the navigation drawer

Most routes are lazy-loaded via dynamic `import()`.

## Key Conventions

### Class-Based Components with Decorators

All components use `vue-class-component` and `vue-property-decorator`:

```typescript
@Component({ components: { AddListButton } })
export default class ManageLists extends Vue {
  @Getter("lists") lists!: Array<List>;
  @Action("upsertList") upsertList!: (req: UpsertListRequest) => Promise<void>;

  get formTitle(): string { /* computed */ }
  async onSave(): Promise<void> { /* method */ }
}
```

Vuex bindings use `vuex-class` decorators (`@Getter`, `@Action`) — not `mapGetters`/`mapActions`.

### Environment Variables

App configuration uses `VUE_APP_*` env vars (Vue CLI convention). Key ones include `VUE_APP_APP_NAME`, `VUE_APP_SITE_URL`, `VUE_APP_SENTRY_DSN`, and Notion API credentials. See the CI workflow for the full list.

### Plugins as Vue Prototypes

Shared utilities are installed as Vue plugins and accessed via `this.$constants` in templates. Plugin source lives in `web/src/plugins/`.

### Icons

Uses `@mdi/js` (Material Design Icons as JS tree-shakable imports), not icon fonts.

### Tests

Jest with `@vue/cli-plugin-unit-jest`. Test files live in `__tests__/` directories alongside source (e.g., `web/src/plugins/__tests__/utils.spec.ts`). Test naming convention: `*.spec.ts`.

### Firestore Security

Rules in `web/firestore.rules` restrict access so users can only read/write their own `states/{userId}` document.
