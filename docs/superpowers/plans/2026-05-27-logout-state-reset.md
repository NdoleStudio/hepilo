# Logout State Reset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reset all application state (lists, items, categories, settings) when a user logs out so the next user gets a fresh experience.

**Architecture:** Add `resetSettings()` to the settings store, add `logout()` to the auth store that orchestrates full reset, and update the layout to call `authStore.logout()` instead of inlining Firebase signOut.

**Tech Stack:** Vue 3, Pinia, Firebase Auth, Vitest

---

### Task 1: Add `resetSettings()` to settings store

**Files:**
- Modify: `web/app/stores/settings.ts:93-103`

- [ ] **Step 1: Add the `resetSettings` function**

Add the function before the `return` statement in `web/app/stores/settings.ts`:

```ts
function resetSettings() {
  currency.value = DEFAULT_CURRENCY
  showIntro.value = true
}
```

- [ ] **Step 2: Export `resetSettings` from the store**

Update the return object in `web/app/stores/settings.ts` to include `resetSettings`:

```ts
return {
  currency,
  showIntro,
  currencySymbol,
  formatCurrency,
  currencySelectItems,
  appData,
  setCurrency,
  setShowIntro,
  resetSettings,
}
```

- [ ] **Step 3: Commit**

```bash
git add web/app/stores/settings.ts
git commit -S -m "feat: add resetSettings to settings store"
```

---

### Task 2: Add `logout()` to auth store

**Files:**
- Modify: `web/app/stores/auth.ts`

- [ ] **Step 1: Add the useFirebase import usage and logout function**

Add the `logout` function after `resetAuth()` in `web/app/stores/auth.ts`:

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

- [ ] **Step 2: Export `logout` from the store**

Update the return object to include `logout`:

```ts
return {
  user,
  isLoggedIn,
  hasProfilePicture,
  setUser,
  deleteAccount,
  resetAuth,
  logout,
}
```

- [ ] **Step 3: Add `settingsStore.resetSettings()` to `deleteAccount` for consistency**

Update the `deleteAccount` function to also reset settings:

```ts
async function deleteAccount(userId: string) {
  const uiStore = useUIStore()
  const listStore = useListStore()
  const settingsStore = useSettingsStore()

  uiStore.setSaving(true)
  listStore.resetState()
  settingsStore.resetSettings()
  await deleteDoc(doc(getFirestore(), 'states', userId))

  uiStore.addNotification({
    type: 'success',
    message: 'Your account has been deleted successfully',
  })
  uiStore.setSaving(false)
}
```

- [ ] **Step 4: Commit**

```bash
git add web/app/stores/auth.ts
git commit -S -m "feat: add logout function to auth store with full state reset"
```

---

### Task 3: Update layout to use `authStore.logout()`

**Files:**
- Modify: `web/app/layouts/default.vue:250-263`

- [ ] **Step 1: Add authStore reference**

After the existing store/composable declarations (around line 238), add:

```ts
const authStore = useAuthStore()
```

- [ ] **Step 2: Replace the inline logout function**

Replace the current `logout()` function at lines 250-263:

```ts
async function logout() {
  try {
    const auth = getFirebaseAuth()
    await auth.signOut()
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

With:

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

- [ ] **Step 3: Remove unused `getFirebaseAuth` import if no longer needed**

Check if `getFirebaseAuth` is used elsewhere in the file (e.g., for account deletion on the same page). If line 272 still uses it, keep the import. If not, remove line 221:

```ts
const { getFirebaseAuth } = useFirebase()
```

- [ ] **Step 4: Commit**

```bash
git add web/app/layouts/default.vue
git commit -S -m "refactor: use authStore.logout() in default layout"
```

---

### Task 4: Verify the build passes

**Files:** None (validation only)

- [ ] **Step 1: Run the build**

```bash
cd web && pnpm build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 2: Run existing unit tests**

```bash
cd web && pnpm test:unit
```

Expected: All existing tests pass.

- [ ] **Step 3: Manual verification checklist**

Confirm mentally:
- `listStore.resetState()` unsubscribes Firestore, clears lists/items/categories/navDrawer/localStorage ✓
- `settingsStore.resetSettings()` resets currency and showIntro ✓
- `auth.signOut()` clears Firebase auth state ✓
- `user.value = null` clears auth store ✓
- `onAuthStateChanged` calling `setUser(null)` is harmless due to early return guard ✓
