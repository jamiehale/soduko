# Tasks

Every task ends with the gate: `npx vitest run`, `npm run lint`, `npm run build`, and `npm run test:e2e` all pass with zero snapshot updates. The gate is written as "passes the gate" below.

## 1. Ramda

- [x] 1.1 Upgrade `ramda` to the latest 0.x. Flip the `R.propEq` arguments in `src/util/board.js` and `src/util/cell.js`, and rewrite `cellValueEquals` as `R.curry((value, cell) => R.propEq(value, 'value', cell))`. Check the changelogs from 0.28 up to the target for other breaking APIs used in `src/`. Verify that the unit tests pass and the change passes the gate.

## 2. React 17

- [x] 2.1 Upgrade `react` and `react-dom` to 17. Verify that `npm ls react` shows no peer conflicts and the change passes the gate.

## 3. MUI v5

- [x] 3.1 Install `@mui/material@5`, `@mui/icons-material@5`, `@emotion/react`, and `@emotion/styled`. Run `npx @mui/codemod v5.0.0/preset-safe src`, then uninstall `@material-ui/core` and `@material-ui/icons`. Verify that `grep -rn @material-ui src` finds nothing and `npm run build` succeeds.
- [x] 3.2 In `src/index.jsx`, wrap the app in `StyledEngineProvider injectFirst` and a MUI `ThemeProvider` whose `createTheme` sets the v4 palette and the `MuiButton`, `MuiTextField`, and `MuiTabs` default props from design Decision 3. Verify that the change passes the gate. Resolve each remaining screenshot diff with a targeted theme override, not a baseline update.
- [x] 3.3 Run the visual suite once against `npm run preview -- --port 3000`. Verify zero snapshot diffs in the production build.

## 4. React 18

- [x] 4.1 Upgrade `react`/`react-dom` to 18 and switch `src/index.jsx` to `createRoot`. Verify that the browser console shows no React deprecation warnings and the change passes the gate.

## 5. MUI v6, v7, and v9

- [x] 5.1 Upgrade to `@mui/material@6` / `@mui/icons-material@6` and run the v6 codemods the migration guide lists for the APIs in use. Verify that the change passes the gate.
- [x] 5.2 Upgrade to `@mui/material@7` / `@mui/icons-material@7`. Migrate `App` and `NewGameDialog` layout to `Stack` and the new `Grid` (`size`), and `TextField` `InputProps` to `slotProps.htmlInput`, as in design Decision 5. Use `GridLegacy` only for diffs that can't otherwise be closed, with a code comment. Verify that the change passes the gate and that the visual suite also passes against `vite preview`.
- [ ] 5.3 Upgrade to `@mui/material@9` / `@mui/icons-material@9` (MUI skipped v8) and run the v9 codemods that apply to the APIs in use. Verify that the change passes the gate, the visual suite also passes against `vite preview`, and the browser console shows no MUI warnings.

## 6. styled-components 6

- [ ] 6.1 Upgrade `styled-components` to 6. Check that `.attrs()` in `Header` and `MarkedCell` still applies, and that the browser console shows no unknown-prop warnings. Optionally convert the `Cell`/`MiniBoard` prop-stripping wrappers to transient `$` props. Verify that the change passes the gate.

## 7. Keyboard listener

- [ ] 7.1 Add `src/hooks/window-event.js` (`useWindowEvent(type, handler)` using `useEffect` plus a ref), use it in `App.jsx`, and uninstall `@use-it/event-listener`. Verify that `npm ls @use-it/event-listener` is empty and the change passes the gate. The e2e keyboard scenarios for values, marks, and Escape cover the behavior.

## 8. React 19

- [ ] 8.1 Upgrade `react`/`react-dom` to 19. Verify that `npm ls` reports no peer-dependency conflicts without `--legacy-peer-deps`, the browser console shows no React warnings, and the change passes the gate.

## 9. Cleanup and documentation

- [ ] 9.1 Uninstall `@testing-library/jest-dom`, `@testing-library/react`, and `@testing-library/user-event`. Verify that `grep -rn @testing-library src e2e` finds nothing and the change passes the gate.
- [ ] 9.2 Bump `package.json` version to 0.3.0. Verify that the Help dialog title reads "soduko v0.3.0" and the masked Help baseline still passes.
- [ ] 9.3 Update `CLAUDE.md`: the stack line with the new majors, the MUI theme overrides and why they exist (preserving the v4 look), `injectFirst` and the styled-components/Emotion layering, and `useWindowEvent`. Update the README's Development section. Verify the docs match `package.json`.

## 10. Integration check

- [ ] 10.1 From a clean checkout under Node 24, run `npm ci`, then the full gate, then the visual suite against `vite preview`. Verify that `npm outdated` lists no major-version lag for any direct dependency except `eslint` / `@eslint/js` (held at 9 because `eslint-plugin-react` does not support ESLint 10).

## Workflow follow-up

- Archive this change once the integration check passes.
