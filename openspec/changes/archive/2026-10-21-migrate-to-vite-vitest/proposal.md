# Proposal

## Why

Create React App is deprecated and stuck on webpack 4. It only builds on current Node with the `--openssl-legacy-provider` workaround added in `add-regression-safety-net`, and its Jest 24 and built-in ESLint are just as dated. The build tool has to be replaced before the runtime libraries can be upgraded (`upgrade-runtime-libraries`), and replacing it first means each later step is checked by a modern toolchain. React, MUI, styled-components, and Ramda stay at their current versions in this change.

## What Changes

- Replace `react-scripts` with Vite and `@vitejs/plugin-react`. Move `index.html` to the project root as Vite's entry. The dev server stays on port 3000.
- Rename source files containing JSX from `.js` to `.jsx`.
- Replace Jest (via CRA) with Vitest. The existing unit tests run unchanged.
- Add ESLint 9 (flat config) with React and react-hooks rules and an `npm run lint` script, replacing CRA's built-in linting.
- Build output stays in `build/` (Vite `build.outDir`) so the current manual deployment is unaffected. Deployment changes are out of scope.
- Remove the `--openssl-legacy-provider` workaround and CRA-only `package.json` fields (`eslintConfig`, `browserslist`).
- Update `CLAUDE.md` and `README.md` for the new commands.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
_None. This is a tooling change; all behavior in the existing specs must stay the same. The change sets `skip_specs: true`._

## Impact

- `package.json`: scripts and dev dependencies (`react-scripts` removed; `vite`, `@vitejs/plugin-react`, `vitest`, `eslint` and plugins added).
- New: `vite.config.js`, `eslint.config.js`, root `index.html`. Removed: `public/index.html`.
- `src/**`: file renames (`.js` → `.jsx` where JSX is used) and matching import paths. No logic changes.
- `playwright.config.js`: `webServer` command if the script name changes. The port stays the same.
- Depends on `add-regression-safety-net`. Its unit, e2e, and visual suites are the acceptance gate.
