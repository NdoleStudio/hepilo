# Switch Font to Manrope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Inter font with Manrope across the entire Hepilo app, switching from `@nuxtjs/google-fonts` to `@nuxt/fonts`.

**Architecture:** Three-layer font change: (1) swap the font-loading module, (2) update Vuetify's CSS custom property `--v-font-body` via defaults config, (3) update the global CSS fallback. All changes are in `web/`.

**Tech Stack:** Nuxt 4, `@nuxt/fonts`, Vuetify 4, pnpm

**Spec:** `web/docs/superpowers/specs/2026-04-06-manrope-font-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `web/package.json` | Remove `@nuxtjs/google-fonts`, add `@nuxt/fonts` |
| Create | `web/app/assets/styles/vuetify-settings.scss` | Override Vuetify SASS variables (`$body-font-family`, `$heading-font-family`) |
| Modify | `web/nuxt.config.ts` | Swap module + config, update Vuetify font family, add SASS configFile, disable inlineStyles for SSR |
| Modify | `web/app/assets/styles/global.scss` | Update CSS font-family fallback |

---

### Task 1: Swap font module dependency

**Files:**
- Modify: `web/package.json`

- [ ] **Step 1: Remove `@nuxtjs/google-fonts` and install `@nuxt/fonts`**

Run from `web/`:

```bash
pnpm remove @nuxtjs/google-fonts && pnpm add @nuxt/fonts
```

Expected: `package.json` no longer lists `@nuxtjs/google-fonts`; `@nuxt/fonts` appears in `dependencies`.

- [ ] **Step 2: Commit**

```bash
git add web/package.json web/pnpm-lock.yaml
git commit -m "chore: replace @nuxtjs/google-fonts with @nuxt/fonts"
```

---

### Task 2: Create Vuetify SASS settings file

**Files:**
- Create: `web/app/assets/styles/vuetify-settings.scss`

- [ ] **Step 1: Create the SASS settings file**

Create `web/app/assets/styles/vuetify-settings.scss` with:

```scss
@forward 'vuetify/settings' with (
  $body-font-family: ('Manrope', sans-serif),
  $heading-font-family: ('Manrope', sans-serif)
);
```

This overrides Vuetify's SASS variables so all compiled typography styles use Manrope instead of the default Roboto.

- [ ] **Step 2: Commit**

```bash
git add web/app/assets/styles/vuetify-settings.scss
git commit -m "style: add Vuetify SASS settings to override font variables"
```

---

### Task 3: Update Nuxt and Vuetify configuration

**Files:**
- Modify: `web/nuxt.config.ts`

- [ ] **Step 1: Replace module entry in the `modules` array**

Change `'@nuxtjs/google-fonts'` → `'@nuxt/fonts'` (line 29).

```ts
// Before
'@nuxtjs/google-fonts',

// After
'@nuxt/fonts',
```

- [ ] **Step 2: Replace `googleFonts` config block with `fonts` config block**

Remove lines 32–37 (`googleFonts: { ... }`). Add in its place:

```ts
fonts: {
  families: [
    {
      name: 'Manrope',
      provider: 'google',
      weights: [300, 400, 500, 600, 700],
    },
  ],
},
```

- [ ] **Step 3: Add SASS configFile and disable inlineStyles for SSR**

Add `styles: { configFile: 'app/assets/styles/vuetify-settings.scss' }` inside `vuetify.moduleOptions`:

```ts
vuetify: {
  moduleOptions: {
    ssrClientHints: {
      reloadOnFirstRequest: false,
      viewportSize: true,
    },
    styles: {
      configFile: 'app/assets/styles/vuetify-settings.scss',
    },
  },
```

Add `features` at the top-level of the Nuxt config (required for SSR + custom SASS):

```ts
features: {
  inlineStyles: false,
},
```

- [ ] **Step 4: Update Vuetify font family default**

In `vuetify.vuetifyOptions.defaults.global.font.family`, change `'Inter'` → `'Manrope'`:

```ts
defaults: {
  global: {
    font: {
      family: 'Manrope',
    },
  },
},
```

- [ ] **Step 5: Commit**

```bash
git add web/nuxt.config.ts
git commit -m "feat: configure Manrope font via @nuxt/fonts, Vuetify defaults, and SASS variables"
```

---

### Task 4: Update global stylesheet

**Files:**
- Modify: `web/app/assets/styles/global.scss`

- [ ] **Step 1: Change font-family on line 2**

```scss
// Before
body, .v-application {
  font-family: 'Inter', sans-serif;
}

// After
body, .v-application {
  font-family: 'Manrope', sans-serif;
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/assets/styles/global.scss
git commit -m "style: update global font-family to Manrope"
```

---

### Task 5: Verify build

- [ ] **Step 1: Run production build**

Run from `web/`:

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Grep for stale Inter references**

```bash
grep -rn "Inter" web/nuxt.config.ts web/app/assets/styles/global.scss
```

Expected: No matches.

- [ ] **Step 3: Final commit (spec + plan docs)**

```bash
git add .
git commit -m "docs: add spec and plan for Manrope font migration"
```
