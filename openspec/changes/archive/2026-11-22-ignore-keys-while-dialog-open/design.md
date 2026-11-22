# Design

## Context

`App.jsx` registers one `keydown` listener on `window` through `useWindowEvent`. MUI dialogs render in a portal and don't stop key events from reaching `window`, so the board handler sees every key typed in a dialog. The one exception is Escape: the dialog stops it after closing itself, so it never reached the board. `App` already owns the open state of all three dialogs: `showNewGame`, `showReset` (from `useConfirmation`), and `showHelp`.

## Goals / Non-Goals

**Goals:**
- One rule for the key handler: a paused game ignores keys. Dialogs are the only reason to pause today, but not the only possible one.

**Non-Goals:**
- Changing how the dialogs themselves handle keys (MUI still closes on Escape).
- Clearing the selection or digit highlight when the game pauses.
- Pausing mouse input. The modal backdrop already blocks clicks on the board.
- Anything the player sees. The app has no timer and shows no "paused" label.

## Decisions

**Paused is computed, not stored.** `App` defines `const isPaused = showNewGame || showReset || showHelp;` next to the dialog state, and `handleKeyDown` returns at once when `isPaused` is true. Add `isPaused` to the `useCallback` dependencies. The dialog flags already hold the facts, so a computed value can't get out of step with them. A new reason to pause is one more term in that expression.

Alternative: a stored `paused` flag with `pause()`/`resume()` called as each dialog opens and closes. Rejected: more code, and every close path (Escape, backdrop click, Cancel, Start, Reset confirm) has to remember `resume()`. One missed call leaves the board deaf to keys with no visible cause.

Alternative: skip events whose target is an `input`/`textarea` or inside `[role="dialog"]`. Rejected: it depends on DOM structure and focus. It also misses Help and Reset (no text field) and keys pressed while focus is on the backdrop.

Alternative: pass `disabled` into `useWindowEvent`. Rejected as more surface for one caller; an early return in the handler is enough.

## Risks / Trade-offs

- [A future dialog added to `App` without joining `isPaused` would leak keys again] → `isPaused` sits next to the dialog state, and the glossary entry names dialogs as the reason to pause.
- [Playwright's `fill()` doesn't fire per-key `keydown` events, so existing tests miss this bug] → New tests type with `pressSequentially` or `keyboard.type`.
