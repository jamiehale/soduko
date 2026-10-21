# Proposal

## Why

Every runtime library is at least one major behind, and some are end-of-life. Material-UI v4 is unmaintained, has been renamed (`@mui/material`), and caps React at 17. React 16 is three majors behind. Ramda 0.27 predates an argument-order change that later versions require. `@use-it/event-listener` is unmaintained. Once `migrate-to-vite-vitest` lands, these are the only outdated parts left, and the safety net from `add-regression-safety-net` can check each step.

## What Changes

The upgrade goes in steps, and each step must pass the full unit, e2e, and visual suites before the next starts. Version constraints set the order: MUI v4 blocks React 18, and styled-components 5 should not run on React 19.

- **Ramda** 0.27 → latest 0.x. Update the `R.propEq` call sites for the flipped argument order (0.29+).
- **React** 16 → 17.
- **Material-UI v4 → MUI v5**: rename packages to `@mui/material` / `@mui/icons-material`, add the Emotion styling engine, and configure the theme and component defaults so the v4 look is preserved.
- **React** 17 → 18 (`createRoot`).
- **MUI** v5 → v6 → v7, including the v7 `Grid` API and deprecated `InputProps`.
- **styled-components** 5 → 6.
- Replace **`@use-it/event-listener`** with a small local hook.
- **React** 18 → 19.
- Remove the unused **`@testing-library/*`** dependencies. No code imports them, and the e2e suite covers UI behavior.
- Bump the app version to 0.3.0 (shown in the Help dialog).

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
_None. Behavior and appearance must not change: every requirement in the existing specs, including `board-appearance`'s visual baselines, holds as-is. The change sets `skip_specs: true`._

## Impact

- `package.json` / `package-lock.json`: nearly every runtime dependency.
- `src/util/cell.js`, `src/util/board.js`: Ramda call sites.
- `src/index.jsx`: root rendering API, plus MUI theme and styling-engine providers.
- All MUI-using components (`App`, `Header`, `Cell`, `MarkedCell`, dialogs): imports, renamed props, `Grid` usage.
- `App.jsx`: keyboard listener, replacing `@use-it/event-listener`.
- `CLAUDE.md`: stack versions and MUI theme notes.
- Depends on `migrate-to-vite-vitest`.
