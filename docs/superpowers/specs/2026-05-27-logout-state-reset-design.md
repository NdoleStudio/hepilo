# Logout State Reset Design

## Problem

When a user logs out of Hepilo, the shopping list items, categories, and settings are not cleared from memory or localStorage. If a different user logs in on the same browser, they briefly see the previous user's data until Firestore sync overwrites it. This is both a UX bug and a data leakage concern.

## Solution

Centralize logout logic in `authStore` (mirroring the legacy Vuex `resetState` pattern) so that all application state is fully cleared on sign-out.

## Changes

### 1. `web/app/stores/settings.ts` — Add `resetSettings()`

Expose a function that resets `currency` to `DEFAULT_CURRENCY` and `showIntro` to `true`.

```ts
function resetSettings() {
  currency.value = DEFAULT_CURRENCY
  showIntro.value = true
}
```

Export it from the store's return object.

### 2. `web/app/stores/auth.ts` — Add `logout()`

Add a `logout()` async function that orchestrates the full state reset:

```ts
async function logout() {
  const listStore = useListStore()
  const settingsStore = useSettingsStore()

  listStore.resetState()
  settingsStore.resetSettings()

  const { getFirebaseAuth } = useFirebase()
  const auth = getFirebaseAuth()
  await auth.signOut()

  user.value = null
}
```

Export `logout` from the store's return object.

### 3. `web/app/layouts/default.vue` — Use `authStore.logout()`

Replace the inline logout function with:

```ts
async function logout() {
  try {
    await authStore.logout()
    uiStore.addNotification({
      type: 'info',
      message: t('auth.logoutSuccess'),
    })
    await router.push(localePath('/'))
  }
  catch (error) {
    console.error('Logout failed:', error)
  }
}
```

## Data Flow

```
User clicks logout
  → authStore.logout()
    → listStore.resetState()
      - unsubscribes Firestore onSnapshot listener
      - clears lists to []
      - resets categoryStore.categories to [DEFAULT_CATEGORY]
      - clears itemStore.items to []
      - sets stateLoaded = false
      - sets uiStore.navDrawerOpen = false
      - removes localStorage entry
    → settingsStore.resetSettings()
      - resets currency to DEFAULT_CURRENCY
      - resets showIntro to true
    → firebase auth.signOut()
    → user = null
  → notification shown
  → redirect to home
```

## Edge Cases

- **`onAuthStateChanged` double-clear**: The Firebase auth listener in `firebase.client.ts` calls `authStore.setUser(null)` after signOut. This is harmless — `setUser` already short-circuits when `user` is already null (`if (newUser === null && user.value === null) return`).
- **Account deletion**: `deleteAccount()` already calls `listStore.resetState()`. It should also call `settingsStore.resetSettings()` for consistency.
- **Offline logout**: `auth.signOut()` works offline (clears local Firebase auth state). Store reset is synchronous and always succeeds.

## Testing

- Verify that after logout, `listStore.lists` is empty, `itemStore.items` is empty, `categoryStore.categories` contains only the default, `settingsStore.currency` is the default, and localStorage key is removed.
- Verify that logging in as a different user loads fresh state from Firestore without remnants of the previous user.
