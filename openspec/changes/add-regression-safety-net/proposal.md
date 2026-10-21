# Proposal

## Why

Every runtime and build dependency is several majors behind, and the CRA 3 / webpack 4 toolchain no longer builds on current Node (`ERR_OSSL_EVP_UNSUPPORTED` on Node 25). The planned upgrades (`migrate-to-vite-vitest`, then `upgrade-runtime-libraries`) touch every file. The only tests cover the pure `src/util/` functions, so nothing would catch a regression in game behavior, UI interaction, saved games, or visual design. This change writes down current behavior as specs and adds tests that enforce it. It changes no runtime behavior and upgrades no dependencies.

## What Changes

- Commit the in-progress yarn → npm switch, pin the Node version (`.nvmrc`), and add a temporary `NODE_OPTIONS=--openssl-legacy-provider` to the `start`/`build` scripts so the current stack runs on modern Node. The next change removes this workaround.
- Remove Netlify references. The project no longer deploys there. Remove the README badge and the "deployed to Netlify" line in `CLAUDE.md`.
- Export the `board` and `selection` reducers and add unit tests for them, plus tests for the derived-state functions `useGame` and `useHighlight`.
- Add Playwright end-to-end tests covering every user-facing behavior in the specs below.
- Add Playwright visual baselines (screenshots) of the board's highlight states and each dialog, to guard the existing design.
- Add a saved-game fixture captured from v0.2.2 and a test that it still loads.
- Document the new test commands in `CLAUDE.md`.

## Capabilities

### New Capabilities
- `board-editing`: entering values and pencil marks, puzzle-cell immutability, related-mark clearing, undo/redo, reset.
- `cell-selection`: click, drag, deselect, and Escape selection behavior, and the highlighting derived from a selection.
- `game-status`: conflict (error) detection and solved detection.
- `puzzle-loading`: starting a new game from a stock or custom puzzle, and the custom-puzzle format.
- `game-persistence`: saving and restoring game state, including undo/redo history, across reloads.
- `board-appearance`: the board's grid, section borders, and the color scheme for cell states.
- `app-help`: the help dialog, including the version it shows.

### Modified Capabilities
_None. There are no existing specs._

## Impact

- `src/hooks/board.js`, `src/hooks/selection.js`: reducers become named exports. No behavior change.
- New: `src/hooks/__tests__/`, `e2e/`, `playwright.config.js`, `.nvmrc`.
- New dev dependency: `@playwright/test`, plus a Chromium download for the browser tests.
- `package.json` scripts: `test:e2e`, plus the temporary OpenSSL flag.
- `README.md`, `CLAUDE.md`: Netlify references removed, test commands documented.
- The README's "Try it out" link to `https://soduko.me` stays; the domain is still served, now deployed manually. Deployment is out of scope.
