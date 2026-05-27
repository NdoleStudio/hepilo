# List-to-Cart Animation Design

## Summary

Add slide + fade animations when items move between the shopping list and the cart in `[listId].vue`. Checking an item slides it down out of the list and into the cart; unchecking reverses the motion.

## Approach

Use Vue's `<TransitionGroup>` component around the `v-list-item` loops in both the shopping list section and the cart section. CSS transitions handle the visual effect.

## Animation Details

| Direction | Exit animation | Enter animation |
|-----------|---------------|-----------------|
| List → Cart (check) | Slide down 20px + fade out (200ms) | Slide in from -20px above + fade in (200ms) |
| Cart → List (uncheck) | Slide up 20px + fade out (200ms) | Slide in from 20px below + fade in (200ms) |

- **Easing:** `ease-out` for both enter and leave
- **Duration:** 200ms (snappy feel)
- **Move transition:** Remaining items smoothly reposition to fill gaps (200ms transform transition via TransitionGroup's move class)

## Transition Names

- `list-item` — applied to the shopping list `<TransitionGroup>`
- `cart-item` — applied to the cart `<TransitionGroup>`

## CSS Classes

```css
/* Shopping list items */
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
.list-item-move {
  transition: transform 0.2s ease-out;
}

/* Cart items */
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
.cart-item-move {
  transition: transform 0.2s ease-out;
}
```

## Implementation Scope

- **File:** `web/app/pages/lists/[listId].vue`
- Wrap existing `v-list-item` v-for loops with `<TransitionGroup>` (tag="div")
- Add scoped `<style>` block with transition CSS
- No changes to store logic, data model, or other files

## Constraints

- Must not interfere with existing click handlers (item edit dialog, delete button)
- Must not break the driver.js intro tour element IDs
- Items leaving the DOM must not block layout during animation (use `position: absolute` in leave-active if needed)
