# Mobile Nav Drawer Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent mobile navigation drawer interactions from updating Firestore while preserving mobile UI state, localStorage persistence, and desktop Firestore persistence.

**Architecture:** Keep `navDrawerOpen` as the single Pinia state value and add an explicit Firestore-persistence flag to the UI store action. The authenticated layout owns viewport detection through Vuetify's reactive `mobile` ref, while the list store stops acting as a secondary Firestore writer for the drawer preference.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, Pinia 3, Vuetify 4 `useDisplay`, Firebase Firestore, Vitest 4, happy-dom

## Global Constraints

- Active development is limited to `web/`; do not modify `web-legacy/`.
- Use Vuetify's reactive `mobile` value from `useDisplay()` for mobile detection.
- Mobile drawer changes must still update Pinia and localStorage.
- Only desktop drawer changes may update the Firestore `navDrawerOpen` field.
- Preserve the existing authentication and `stateLoaded` guards.
- Do not change startup restoration, the Vuetify mobile breakpoint, or demo behavior.

---

## File Structure

- `web/app/stores/ui.ts`: owns the drawer state and the only permitted Firestore write for `navDrawerOpen`.
- `web/app/layouts/default.vue`: supplies desktop/mobile persistence intent for every drawer interaction.
- `web/app/stores/list.ts`: persists list-domain state without writing the drawer preference to Firestore.
- `web/app/stores/__tests__/ui.spec.ts`: verifies transient mobile updates and persisted desktop updates.
- `web/app/stores/__tests__/list.spec.ts`: verifies broad list saves cannot overwrite the Firestore drawer preference.

### Task 1: Guard UI Store Drawer Persistence by Viewport

**Files:**
- Create: `web/app/stores/__tests__/ui.spec.ts`
- Modify: `web/app/stores/ui.ts:59-78`
- Modify: `web/app/layouts/default.vue:4,237-259`

**Interfaces:**
- Consumes: Vuetify `useDisplay(): { mobile: Ref<boolean> }`
- Produces: `setNavDrawer(isOpen: boolean, persistToFirestore?: boolean): Promise<void>`
- Produces: `toggleNavDrawer(persistToFirestore?: boolean): Promise<void>`

- [ ] **Step 1: Write failing UI store tests**

Create `web/app/stores/__tests__/ui.spec.ts`:

```typescript
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { setDocMock, persistToLocalStorageMock } = vi.hoisted(() => ({
  setDocMock: vi.fn(),
  persistToLocalStorageMock: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => 'firestore'),
  doc: vi.fn(() => 'state-doc'),
  setDoc: setDocMock,
}))

const authStore = {
  isLoggedIn: true,
  user: { id: 'user-1' },
}

const listStore = {
  stateLoaded: true,
  persistToLocalStorage: persistToLocalStorageMock,
}

vi.stubGlobal('defineStore', defineStore)
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('useAuthStore', () => authStore)
vi.stubGlobal('useListStore', () => listStore)

const { useUIStore } = await import('../ui')

describe('UI store nav drawer persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setDocMock.mockReset()
    persistToLocalStorageMock.mockReset()
    authStore.isLoggedIn = true
    listStore.stateLoaded = true
  })

  it('keeps mobile drawer changes local', async () => {
    const store = useUIStore()

    await store.setNavDrawer(true, false)

    expect(store.navDrawerOpen).toBe(true)
    expect(persistToLocalStorageMock).toHaveBeenCalledOnce()
    expect(setDocMock).not.toHaveBeenCalled()
  })

  it('persists desktop drawer changes to Firestore', async () => {
    const store = useUIStore()

    await store.setNavDrawer(true)

    expect(setDocMock).toHaveBeenCalledWith(
      'state-doc',
      { navDrawerOpen: true },
      { merge: true },
    )
  })

  it('does not persist before list state is loaded', async () => {
    listStore.stateLoaded = false
    const store = useUIStore()

    await store.setNavDrawer(true)

    expect(store.navDrawerOpen).toBe(true)
    expect(persistToLocalStorageMock).toHaveBeenCalledOnce()
    expect(setDocMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the UI store tests to verify failure**

Run from `web/`:

```powershell
pnpm test:unit app/stores/__tests__/ui.spec.ts
```

Expected: FAIL because `setNavDrawer(true, false)` still calls `setDoc`.

- [ ] **Step 3: Add the explicit Firestore persistence flag**

Update the drawer actions in `web/app/stores/ui.ts`:

```typescript
async function toggleNavDrawer(persistToFirestore = true) {
  await setNavDrawer(!navDrawerOpen.value, persistToFirestore)
}

async function setNavDrawer(isOpen: boolean, persistToFirestore = true) {
  navDrawerOpen.value = isOpen

  const authStore = useAuthStore()
  const listStore = useListStore()
  listStore.persistToLocalStorage()

  if (!persistToFirestore || !authStore.isLoggedIn || !listStore.stateLoaded) return

  await setDoc(
    doc(getFirestore(), 'states', authStore.user!.id),
    { navDrawerOpen: navDrawerOpen.value },
    { merge: true },
  )
}
```

- [ ] **Step 4: Route every layout drawer change through `mobile`**

In `web/app/layouts/default.vue`, change the app-bar button to write through the
computed drawer setter:

```vue
<v-app-bar-nav-icon @click="navDrawerOpen = !navDrawerOpen" />
```

Read Vuetify's mobile ref:

```typescript
const { mdAndUp, mobile } = useDisplay()
```

Pass desktop persistence intent from the computed setter:

```typescript
const navDrawerOpen = computed({
  get: () => uiStore.navDrawerOpen,
  set: (value: boolean) => {
    uiStore.setNavDrawer(value, !mobile.value)
  },
})
```

This covers both app-bar clicks and `v-navigation-drawer` model updates such as
mobile scrim dismissal.

- [ ] **Step 5: Run the UI store tests**

Run from `web/`:

```powershell
pnpm test:unit app/stores/__tests__/ui.spec.ts
```

Expected: PASS with 3 tests.

- [ ] **Step 6: Commit the guarded UI persistence**

```powershell
git add -- app/stores/ui.ts app/layouts/default.vue app/stores/__tests__/ui.spec.ts
git commit -m "fix(nav): keep mobile drawer state local" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" -m "Copilot-Session: 15ed0b61-bd0c-4cde-9b98-522e55bc0486"
```

### Task 2: Remove the List Store Drawer Write Path

**Files:**
- Create: `web/app/stores/__tests__/list.spec.ts`
- Modify: `web/app/stores/list.ts:235-258`

**Interfaces:**
- Consumes: `useListStore().saveState(): Promise<void>`
- Produces: A list-state Firestore payload that never contains `navDrawerOpen`

- [ ] **Step 1: Write the failing list store test**

Create `web/app/stores/__tests__/list.spec.ts`:

```typescript
import { createPinia, defineStore, setActivePinia } from 'pinia'
import { computed, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { setDocMock } = vi.hoisted(() => ({
  setDocMock: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => 'firestore'),
  doc: vi.fn(() => 'state-doc'),
  setDoc: setDocMock,
  onSnapshot: vi.fn(),
  getDoc: vi.fn(),
}))

vi.mock('~/plugins/sentry.client', () => ({
  captureSentryError: vi.fn(),
}))

const authStore = {
  isLoggedIn: true,
  user: { id: 'user-1' },
}
const itemStore = { items: [] }
const categoryStore = { categories: [] }
const settingsStore = { currency: 'USD', showIntro: false }
const uiStore = {
  loading: false,
  saving: false,
  title: '',
  notification: {},
  navDrawerOpen: true,
}

vi.stubGlobal('defineStore', defineStore)
vi.stubGlobal('ref', ref)
vi.stubGlobal('computed', computed)
vi.stubGlobal('useAuthStore', () => authStore)
vi.stubGlobal('useItemStore', () => itemStore)
vi.stubGlobal('useCategoryStore', () => categoryStore)
vi.stubGlobal('useSettingsStore', () => settingsStore)
vi.stubGlobal('useUIStore', () => uiStore)

const { useListStore } = await import('../list')

describe('List store Firestore persistence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setDocMock.mockReset()
    localStorage.clear()
  })

  it('does not persist the nav drawer preference', async () => {
    const store = useListStore()

    await store.saveState()

    const payload = setDocMock.mock.calls[0]![1]
    expect(payload).not.toHaveProperty('navDrawerOpen')
  })
})
```

- [ ] **Step 2: Run the list store test to verify failure**

Run from `web/`:

```powershell
pnpm test:unit app/stores/__tests__/list.spec.ts
```

Expected: FAIL because the `saveState` Firestore payload contains
`navDrawerOpen`.

- [ ] **Step 3: Remove the drawer field from broad list saves**

In `web/app/stores/list.ts`, change the `saveState` Firestore payload to:

```typescript
{
  lists: lists.value,
  selectedListId: selectedListId.value,
  items: itemStore.items,
  categories: categoryStore.categories,
  currency: settingsStore.currency,
  showIntro: settingsStore.showIntro,
}
```

Keep `navDrawerOpen` in `persistToLocalStorage`; mobile drawer interactions must
remain locally persistent.

- [ ] **Step 4: Run both focused test files**

Run from `web/`:

```powershell
pnpm test:unit app/stores/__tests__/ui.spec.ts app/stores/__tests__/list.spec.ts
```

Expected: PASS with 4 tests.

- [ ] **Step 5: Run type checking**

Run from `web/`:

```powershell
pnpm exec nuxi typecheck
```

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 6: Commit the single-writer Firestore boundary**

```powershell
git add -- app/stores/list.ts app/stores/__tests__/list.spec.ts
git commit -m "fix(nav): isolate drawer Firestore writes" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>" -m "Copilot-Session: 15ed0b61-bd0c-4cde-9b98-522e55bc0486"
```
