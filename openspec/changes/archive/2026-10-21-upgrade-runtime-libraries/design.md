# Design

## Context

See proposal.md for why. State after `migrate-to-vite-vitest`:

- **Ramda:** `R.propEq` is used at `src/util/board.js` (`resetBoard`) and `src/util/cell.js` (`isPuzzleCell`, and `cellValueEquals = R.propEq('value')`, which is partially applied and called as `cellValueEquals(value, cell)` from `Board`). `R.propIs` keeps its argument order.
- **MUI usage:** Typography, Button, IconButton, Container, Grid, Box, Dialog family, TextField (one `select`, one with `InputProps.inputProps.maxLength`), Tabs/Tab, MenuItem, Link, and three icons. Nothing uses `makeStyles`/`withStyles`, so no JSS migration is needed. There is no MUI `ThemeProvider`, so the app uses MUI v4's default theme (primary `#3f51b5`, secondary `#f50057`).
- **styled-components** wraps MUI `Typography` in `Header`, `Cell`, and `MarkedCell`. It overrides font size, color, and line height, which only works if its CSS is injected after MUI's. The custom-prop wrappers in `Cell` and `MiniBoard` already strip non-DOM props by hand.
- **Grid:** `App` uses a column `Grid container` with `item xs={12}` children and a row with three `item xs={4}`, plus `justify=`. `NewGameDialog` uses `Grid container justify=… item`.
- **React root:** `ReactDOM.render` in `src/index.jsx`. Keyboard input uses `@use-it/event-listener` on `window` `keydown`.
- **Testing libraries:** `@testing-library/*` are listed as dependencies but imported nowhere.

## Goals / Non-Goals

**Goals:**
- Reach the current majors of React, MUI, styled-components, and Ramda with no change in behavior or rendering.
- Every intermediate step builds and passes all suites, so a failure points at one upgrade.

**Non-Goals:**
- Visual refresh, new features, TypeScript.
- Adopting MUI's `sx`/`styled` in place of styled-components. Both libraries stay as they are.
- Adding `StrictMode`. It's harmless but out of scope, and it changes dev-only behavior.
- Fixing existing quirks: for example, starting a new game does not clear the selection.

## Decisions

**1. Upgrade order: Ramda → React 17 → MUI 5 → React 18 → MUI 6 → MUI 7 → MUI 9 → styled-components 6 → drop event-listener → React 19 → drop testing libs → version bump.**
- MUI v4's peer range stops at React 17, so React 18 has to wait for MUI 5.
- Moving MUI to its current major before React 19 puts each package on a version that officially supports its partner. MUI skipped v8, so the step after v7 is v9.
- styled-components 6 goes before React 19 because v5 predates it.
- Ramda is independent and covered by unit tests, so it goes first as a warm-up.

Each arrow is one commit that passes `npx vitest run`, `npm run lint`, `npm run build`, and `npm run test:e2e` with no snapshot updates.

**2. Ramda: keep the point-free style.**
- Flip the arguments: `R.propEq('puzzle', 'type')`, `R.propEq('user', 'type')`.
- Rewrite `cellValueEquals` as `R.curry((value, cell) => R.propEq(value, 'value', cell))` so its external signature `(value, cell)` doesn't change.
- Check the changelogs for other breaking changes between 0.28 and the target, and grep for each one.

**3. MUI v5 migration via the official codemod, then explicit v4-look defaults.**
Run `npx @mui/codemod v5.0.0/preset-safe src`, which renames imports, `justify`→`justifyContent`, etc. Then wrap the app in `<StyledEngineProvider injectFirst>` and a MUI `ThemeProvider` with `createTheme` set as follows:
- `palette.primary.main: '#3f51b5'`, `palette.secondary.main: '#f50057'` (the v4 defaults).
- `components.MuiButton.defaultProps.color: 'inherit'`. In v4, un-colored buttons were dark grey; v5 makes them primary blue.
- `components.MuiTextField.defaultProps.variant: 'standard'`. v5 defaults to outlined. preset-safe may already add `variant="standard"` at each call site; either way is fine.
- `components.MuiTabs.defaultProps`: `indicatorColor: 'secondary'`, `textColor: 'inherit'`. These are v4's defaults (pink indicator, inherited text).

`injectFirst` puts Emotion's styles first, so the existing styled-components overrides still win. This matches how v4 JSS and styled-components layered.

*Alternative:* `@mui/styled-engine-sc`, which makes MUI use styled-components. Rejected: MUI documents it as having limitations and recommends Emotion. Keeping both engines with `injectFirst` is the documented interop path.

The styled-components `ThemeProvider` (board colors) stays separate from MUI's theme.

**4. React 18: `createRoot` only.**
Automatic batching doesn't affect this app: all state goes through reducers, and no code reads state synchronously after setting it.

**5. MUI v7 layout: migrate to the new `Grid`, with `GridLegacy` as the fallback.**
v7 makes the former Grid2 the default `Grid`. It drops `item`, uses `size={{ xs: 4 }}`, and does not support `direction="column"` containers.
- `App`: replace the outer column `Grid` with `Stack spacing={1} alignItems="center"`, and convert the three-column control row to `Grid container` + `Grid size={4}`.
- `NewGameDialog`'s menu rows: a `Stack direction="row" justifyContent="space-between" alignItems="center"`.
- `TextField` `InputProps={{ inputProps }}` → `slotProps={{ htmlInput: { maxLength: 81 } }}`.

If the visual suite shows spacing differences that can't be closed without hacks, switch the affected file to `GridLegacy` and record it as follow-up debt. Don't update baselines to hide the difference.

**6. styled-components 6.**
v6 no longer filters unknown props before they reach the DOM. The existing wrappers already strip them, so no change is required. Converting `Cell` and `MiniBoard` to transient props (`$highlight`, `$error`, `$borderLeft`…) and deleting the wrapper components is in scope only if it's a pure simplification that the visual suite confirms. Check that `.attrs()` in `Header` and `MarkedCell` still merges with the explicit props passed at the call sites.

**7. Replace `@use-it/event-listener` with a local `useWindowEvent(type, handler)` hook.**
It goes in `src/hooks/`, uses `useEffect` and a ref so the listener isn't re-registered on every render, and has the same call shape. The e2e keyboard tests cover it.

**8. Remove `@testing-library/*` instead of upgrading.**
Nothing imports them. Removing them drops three outdated packages, and future component tests can add current versions when needed.

**9. Version bump to 0.3.0.**
The Help title shows it, and the visual baseline masks the version text, so no snapshot changes.

**10. ESLint stays on 9.**
ESLint 10 is out, but `eslint-plugin-react` (7.37) only supports ESLint up to 9. Keeping its React rules matters more than the ESLint major, so ESLint 9 is a recorded exception to "current majors" until the plugin catches up.

## Risks / Trade-offs

- [MUI v5 changes other default styles beyond those listed (typography line heights, dialog padding, menu sizing)] → The visual suite is the authority. Fix each diff with a targeted theme override, not a baseline update. List every override in `CLAUDE.md` so future work knows why it's there.
- [CSS injection order between Emotion and styled-components breaks in production but not dev] → Run the visual suite against `vite preview` at the MUI 5 and MUI 7 steps.
- [MUI v7's stricter package `exports` break deep imports (`@mui/material/X/Y`)] → The codebase uses only one-level imports (`@mui/material/Button`), which are allowed. Lint and build catch the rest.
- [Peer-dependency conflicts mid-sequence (an intermediate MUI release not declaring support for the installed React)] → Follow the order in Decision 1. Use `--legacy-peer-deps` only for a single intermediate step, never in the final state, and note it in that commit.
- [Ramda changes outside `propEq` are missed] → Unit tests cover all `src/util/` functions, and the e2e suite covers their callers.

## Migration Plan

One branch, one commit per arrow in Decision 1, each passing all gates. Rollback is a revert of the failing commit. There's no deployment. Saved games are unaffected because the state shape doesn't change, and the v0.2.2 fixture test confirms this at every step.
