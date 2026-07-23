# Mobile Nav Drawer Persistence Design

## Goal

Keep mobile navigation drawer interactions transient for Firestore while preserving
the existing drawer behavior and localStorage persistence. Only desktop drawer
changes may update the `navDrawerOpen` field in the user's `states` document.

## Current Behavior

The authenticated layout binds `v-navigation-drawer` to a computed value backed by
`useUIStore().navDrawerOpen`. Its setter calls `setNavDrawer`, which updates the
Pinia state, persists the full local state to localStorage, and writes
`navDrawerOpen` to Firestore.

The list store also includes `navDrawerOpen` in its broad `saveState` Firestore
payload. Consequently, skipping the UI store's direct write alone would not be
enough: a later list mutation on mobile could still persist the transient mobile
drawer value.

## Design

The authenticated layout will read Vuetify's reactive `mobile` value from
`useVDisplay()`. When its drawer computed setter calls `uiStore.setNavDrawer`, it
will pass whether Firestore persistence is allowed.

`setNavDrawer` will always:

- update `navDrawerOpen`, so the mobile drawer still opens and closes;
- call `listStore.persistToLocalStorage()`, preserving current local behavior.

It will write `navDrawerOpen` to Firestore only when:

- Firebase persistence is allowed by the layout;
- the user is authenticated;
- the list state has finished loading.

The list store's general `saveState` Firestore payload will no longer include
`navDrawerOpen`. This makes the guarded UI action the single Firestore writer for
the drawer preference and prevents unrelated mobile mutations from leaking the
transient value into Firebase.

## Data Flow

### Mobile

1. Vuetify reports `mobile.value === true`.
2. The user opens or closes the drawer.
3. The layout calls `setNavDrawer(value, false)`.
4. Pinia and localStorage receive the new value.
5. Firestore is not updated.

### Desktop

1. Vuetify reports `mobile.value === false`.
2. The user opens or closes the drawer.
3. The layout calls `setNavDrawer(value, true)`.
4. Pinia and localStorage receive the new value.
5. Firestore receives the new value when authentication and state-loading guards
   pass.

## Error Handling

The existing Firestore error propagation remains unchanged. The mobile path does
not start a Firestore operation, while desktop failures continue to reject the
store action rather than being silently treated as successful.

## Testing

Focused UI store tests will verify that:

- a mobile-style call updates the Pinia drawer value and localStorage path without
  calling Firestore;
- a desktop-style call writes the drawer value to Firestore when authenticated and
  loaded;
- authentication and state-loading guards still prevent premature Firestore
  writes.

The list store behavior will also be checked to ensure its broad Firestore save no
longer contains `navDrawerOpen`.

## Scope

This change does not alter how the drawer is restored on startup, the configured
Vuetify mobile breakpoint, unauthenticated demo behavior, or localStorage
persistence.
