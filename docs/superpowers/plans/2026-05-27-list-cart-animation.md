# List-to-Cart Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add slide + fade animations when items move between the shopping list and cart in `[listId].vue`.

**Architecture:** Vue 3 `<TransitionGroup>` (fragment mode, no wrapper element) around item loops in both list and cart sections. CSS transitions handle the visual slide + fade effect at 200ms.

**Tech Stack:** Vue 3 TransitionGroup, CSS transitions

---

### Task 1: Add TransitionGroup to Shopping List Items

**Files:**
- Modify: `web/app/pages/lists/[listId].vue:385-433` (list items v-for)

- [ ] **Step 1: Wrap list items with TransitionGroup**

In the template, find the inner `v-list-item` v-for loop (line 385-433) inside the category template loop. Wrap it with `<TransitionGroup>`:

Replace:
```vue
<v-list-item
  v-for="(item, listIndex) in categoryItem.items"
  :key="item.item.id"
  @click="itemClicked(item)"
>
```

With:
```vue
<TransitionGroup name="list-item">
  <v-list-item
    v-for="(item, listIndex) in categoryItem.items"
    :key="item.item.id"
    @click="itemClicked(item)"
  >
    <!-- ... existing content unchanged ... -->
  </v-list-item>
</TransitionGroup>
```

The full change wraps lines 385-433 (from `<v-list-item` through its closing `</v-list-item>`) inside `<TransitionGroup name="list-item">...</TransitionGroup>`.

- [ ] **Step 2: Verify no syntax errors**

Run: `cd web && pnpm build`
Expected: Build succeeds with no template compilation errors.

---

### Task 2: Add TransitionGroup to Cart Items

**Files:**
- Modify: `web/app/pages/lists/[listId].vue:467-496` (cart items v-for)

- [ ] **Step 1: Wrap cart items with TransitionGroup**

In the cart section, find the inner `v-list-item` v-for loop (line 467-496) inside the category template loop. Wrap it with `<TransitionGroup>`:

Replace:
```vue
<v-list-item
  v-for="item in categoryItem.items"
  :key="item.item.id"
  @click="itemClicked(item)"
>
```

With:
```vue
<TransitionGroup name="cart-item">
  <v-list-item
    v-for="item in categoryItem.items"
    :key="item.item.id"
    @click="itemClicked(item)"
  >
    <!-- ... existing content unchanged ... -->
  </v-list-item>
</TransitionGroup>
```

The full change wraps lines 467-496 (from `<v-list-item` through its closing `</v-list-item>`) inside `<TransitionGroup name="cart-item">...</TransitionGroup>`.

- [ ] **Step 2: Verify no syntax errors**

Run: `cd web && pnpm build`
Expected: Build succeeds.

---

### Task 3: Add CSS Transition Classes

**Files:**
- Modify: `web/app/pages/lists/[listId].vue:629-647` (scoped style block)

- [ ] **Step 1: Add transition CSS before the existing `.dialog-responsive` rule**

Insert the following CSS at line 630 (after `<style scoped>`, before `.dialog-responsive`):

```css
/* List item transitions: slide down + fade when moving to cart */
.list-item-enter-active,
.list-item-leave-active {
  transition: all 0.2s ease-out;
}
.list-item-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-item-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.list-item-leave-active {
  position: absolute;
  width: 100%;
}
.list-item-move {
  transition: transform 0.2s ease-out;
}

/* Cart item transitions: slide from above + fade when appearing in cart */
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.2s ease-out;
}
.cart-item-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.cart-item-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.cart-item-leave-active {
  position: absolute;
  width: 100%;
}
.cart-item-move {
  transition: transform 0.2s ease-out;
}

```

Key notes:
- `leave-active { position: absolute }` ensures leaving items don't hold space, allowing remaining items to smoothly reposition via the move class.
- List items slide DOWN (positive translateY) on both enter-from and leave-to — entering items appear to arrive from above, leaving items fall away.
- Cart items slide from ABOVE (negative translateY) — entering items drop in from the top, leaving items rise up.

- [ ] **Step 2: Verify build**

Run: `cd web && pnpm build`
Expected: Build succeeds.

- [ ] **Step 3: Commit all changes**

```bash
git add web/app/pages/lists/[listId].vue
git commit -S -m "feat: add slide+fade animation for list-to-cart transitions

Items slide down and fade out when checked (moved to cart), and slide
up and fade out when unchecked (moved back to list). Uses Vue
TransitionGroup with 200ms ease-out CSS transitions.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: Manual QA Verification

- [ ] **Step 1: Start dev server**

Run: `cd web && pnpm dev`

- [ ] **Step 2: Test in browser**

Navigate to a list page with multiple items. Verify:
1. Checking an item: it slides down + fades out, remaining items shift up smoothly, item appears in cart with a slide-in from above
2. Unchecking a cart item: it slides up + fades out, item reappears in the list with a slide-in from below
3. Rapid toggling: animations don't stack or glitch
4. Delete button still works without animation interference
5. Item click (edit dialog) still works
