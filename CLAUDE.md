# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sudoku *helper* (not a solver or generator), served at soduko.me (deployed by GitHub Actions; see CI and deployment below). Vite with React 19, MUI 9 (`@mui/material`, Emotion engine), styled-components 6, and Ramda 0.32. Plain JavaScript, no TypeScript.

## Commands

Use npm (`package-lock.json`); Node version is pinned in `.nvmrc`.

- `npm start` — Vite dev server on http://localhost:3000
- `npm run build` — production build into `build/` (not Vite's default `dist/`; the deploy uploads `build/`)
- `npm run preview` — serve the production build on :3000
- `npm test` — Vitest (watch mode in a terminal; runs once when `CI` is set)
- `npx vitest run` — unit tests once
- `npx vitest run src/hooks/__tests__/board.test.js` — single unit test file
- `npx vitest run -t "name of test"` — unit tests matching a name
- `npm run lint` — ESLint 9 flat config (`eslint.config.js`), tuned to match the old CRA `react-app` rules. Stays on ESLint 9 until `eslint-plugin-react` supports ESLint 10
- `npm run test:e2e` — Playwright behavior + visual suite (Chromium); starts the dev server itself or reuses one already on :3000
- `npx playwright test e2e/board-editing.spec.js` — single e2e spec; add `-g "test name"` to filter
- `npx playwright test --update-snapshots` — regenerate visual baselines. Only for an intended visual change or a confirmed environment-only diff (font/OS update); review the new PNGs and say why in the commit.

Source files containing JSX use `.jsx`; plain JS stays `.js`. `vite.config.mjs` holds the Vite and Vitest config (`.mjs` because `package.json` is CommonJS, which the Playwright and ESLint configs rely on).

## Tests

- **Unit** (`src/**/__tests__/`): pure `src/util/` functions, the exported `boardReducer`/`selectionReducer`, and `useGame`/`useHighlight` (plain functions, called directly). They use Vitest globals (`describe`/`it`/`expect`); none need a DOM, so Vitest runs in the `node` environment.
- **E2E** (`e2e/*.spec.js`): one spec per capability in `openspec/specs/`, plus `visual.spec.js` (screenshots in `e2e/visual.spec.js-snapshots/`, Linux/Chromium-specific). Screenshots compare with a per-pixel `threshold` of 0.05 (`playwright.config.js`); Playwright's default 0.2 can't tell the peer (`#ddf`) and related (`#ffff44`) backgrounds from white. These are the regression gate for dependency upgrades and must not depend on React/MUI internals.
- DOM hooks for tests: `data-testid="board"`, `data-cell="<index>"` on each cell, and `data-testid` `help`/`undo`/`redo` on the icon buttons. Keep them when refactoring components.
- `e2e/helpers.js` seeds a game by writing the saved-game format to `localStorage` before load (`open(page, puzzle, { values, marks, history, future })`) and reads cell value/marks/colors from the DOM. Assert highlight state through computed colors.
- `e2e/fixtures/saved-game-v0.2.2.json` is a real v0.2.2 save; never regenerate it. `e2e/capture-fixture.js` exists only to capture fixtures for future formats.

## CI and deployment

- **`.github/workflows/ci.yml`** runs on every pull request and is also called by the deploy workflow. It runs `npm ci`, `npx vitest run`, `npm run lint`, `npm run build`, and `npm run test:e2e`, then uploads `build/` as the `build` artifact (and the Playwright report on failure). Node comes from `.nvmrc`. It is pinned to `runs-on: ubuntu-24.04` because the visual baselines pass there; moving to a newer image is a deliberate change that needs the visual suite checked first.
- **`.github/workflows/deploy.yml`** runs on push to `main` and by hand (`workflow_dispatch`). Pushes that touch only `openspec/**`, `.claude/**`, `README.md`, or `CLAUDE.md` don't deploy (`paths-ignore`); a push that also touches anything else does. It runs CI, then deploys that exact `build` artifact without rebuilding. The upload goes to the host over FTPS with `lftp`, against the `production` environment (only `main` may deploy). Deploys queue; they never overlap.
- **Environment `production`:**
  - secrets: `FTP_USER`, `FTP_PASSWORD`
  - variables: `FTP_HOST`, `FTP_PORT` (default 21), `FTP_REMOTE_DIR` (the web root as the FTP user sees it, default `/`)
  - the password reaches `lftp` through `LFTP_PASSWORD`/`--env-password`, never the command line
- **Upload order:**
  1. `assets/` first, so the live `index.html` never points at missing bundles
  2. the root files, never deleting, so host files such as `.htaccess` survive
  3. a `--delete` pass over `assets/` only, which prunes stale bundles
- **Rehearsal:** run the workflow by hand with `dry_run` checked. It connects, verifies TLS, checks the web root exists, and lists what would change without writing. The script `cd`s into the web root before mirroring because `mirror --dry-run` alone exits 0 on connection and TLS errors.
- **Rollback:** revert the commit on `main`; the push redeploys the previous build.
- **PR screenshots:** for UI changes, the `pr-screenshots` skill (`.claude/skills/pr-screenshots/`) posts a before/after table to the PR. Images live on the orphan `pr-screenshots` branch, which nothing deploys or merges.

## Glossary

Use these words in specs, code, tests, on-screen text, and docs.

| Term | Meaning | In code |
|---|---|---|
| puzzle | The starting pattern: a stock puzzle, a custom puzzle, or the mini preview in the New Game dialog. 81 characters, `.`/`0` for blanks | `puzzle`, `stockPuzzle`, `customPuzzle`, `MiniPuzzle` |
| board | The 81 cells the player interacts with. A new game populates it from a puzzle | `board` |
| cell | One of the 81 squares on the board | `cell`, index `0`–`80` |
| given cell, given value | A cell populated from the puzzle; it can't be changed (not "clue") | `type: 'given'`, `isGivenCell`, `GivenCell` |
| player cell, player value | Every other cell; the player sets its value or pencil marks (not "user" or "entered value") | `type: 'player'`, `isPlayerCell…`, `PlayerCell` |
| value | The digit 1–9 a cell holds | `value` (a number) |
| pencil marks | Small candidate digits in an empty player cell (not "notes") | `marks`, `value` as an array |
| struck mark | A digit the player has ruled out for an empty player cell, shown as a pencil mark with a red line through it (not "not possible" or "excluded") | `strikes`, `setStrike`, `cellHasStrike` |
| row, column, box | The three kinds of 9-cell group; a box is one of the nine 3×3 areas (not "section") | `rowFromCount`, `columnFromCount`, `boxFromCount` |
| peer | A cell sharing a row, column, or box with another; also the highlight style | `'peer'` |
| related | An empty cell with a pencil mark of the selected value; also the highlight style | `'related'` |
| conflict | Two cells with the same value in one row, column, or box; shown in the error style | `errorCells` |
| selection | The selected cells | `selectedCells` |
| game | The board plus its undo/redo history; what is saved | `{ board, history, future }` |

## Architecture

**Board model.** A board is a flat array of 81 cells, indexed row-major (`row * 9 + column`). `src/util/board.js` provides `rowFromCount`/`columnFromCount`/`boxFromCount` to derive position from an index. A cell is `{ type, value }`:
- `type: 'given'` — a given cell, populated from the puzzle; `value` is a number; immutable.
- `type: 'player'` — a player cell; `value` is either a number (a player value) or an array of pencil marks (sorted, unique). An empty player cell may also carry `strikes`, its struck marks (sorted, unique, never overlapping its pencil marks). The key is absent when there are none, so older saves need no migration; setting a value drops it.

Saves from before v0.4.0 used `'puzzle'`/`'user'`; `migrateSavedGame` (`src/util/saved-game.js`) converts them when the game loads.

`src/util/cell.js` holds the cell predicates/transforms; `src/util/board.js` holds pure board transforms (`boardWith…` functions). These are curried Ramda-style. Setting a value toggles it (same value clears it) and clears that mark from related cells in the same row/column/box.

**Puzzle input.** `src/util/decoder.js` turns an 81-char string (`.` or `0` for blanks, whitespace ignored) into an array of numbers and `'.'`, which `makeBoard` converts into a board of given and player cells. Stock puzzles are strings in `src/puzzles/top95.js`.

**State lives in hooks (`src/hooks/`), wired together in `App.jsx`:**
- `board.js` — `useReducer` holding `{ board, history, future }` for undo/redo (history/future are stacks of whole boards). Persisted to `localStorage` under key `soduko` via `local-storage.js`, so changes to the state shape affect saved games: convert old saves in `migrateSavedGame`. Exports action-creator helpers (`setCellValue(dispatch, …)`, `undo(dispatch)`, etc.) rather than raw dispatches.
- `selection.js` — mouse down/drag/up selection of cell indices; clicking the single selected cell again deselects.
- `game.js` — derives `isSolved` and `errorCells` (conflicts) from the board each render.
- `highlight.js` — derives which rows/columns/boxes/value to highlight from the selection.
- `confirmation.js` — generic confirm-before-action dialog state.
- `window-event.js` — `useWindowEvent(type, handler)`: one `window` listener per event type, latest handler read from a ref. Drives the keyboard input.
- `logging-reducer.js` — debug wrapper for reducers (not used by default).

**Input semantics** (in `App.jsx`'s `keydown` handler, via `useWindowEvent`): a digit with one selected cell sets its value; with multiple cells selected (or while still dragging) it toggles that pencil mark across them. Shift plus a digit (matched by `event.code`, so any layout works) toggles that struck mark across the selected cells, however many. With nothing selected, a digit highlights that digit as if a cell holding it were selected (`highlightDigit` in the selection state); the same digit again, Escape, or a press on a cell clears it. Escape clears the selection.

**Rendering:** `Board` → `Cell`, which delegates to `MarkedCell` for pencil marks; `hooks/border.js` computes the thicker box borders. `MiniPuzzle` is the read-only puzzle preview in `NewGameDialog`. Board colors and styling tokens come from `src/theme.js` via styled-components' `ThemeProvider`; layout and dialogs use MUI.

**Styling layers.** Two engines coexist: MUI renders with Emotion, and the app's own styles (including overrides of MUI `Typography` in `Header`, `Cell`, `MarkedCell`) use styled-components. `src/index.jsx` wraps the app in `StyledEngineProvider injectFirst`, which injects Emotion's styles first so styled-components rules win; removing it breaks the board's fonts and colors. Pass custom props to styled DOM elements only through the existing prop-stripping wrappers (or `$`-prefixed transient props) — styled-components 6 forwards unknown props to the DOM.

**MUI theme (`src/mui-theme.js`).** The app was designed on Material-UI v4, and the visual baselines lock that look in. The theme restores v4 defaults that later MUI versions changed: indigo/pink palette, `inherit`-colored buttons, `standard` text fields, pink tab indicator with inherited tab text, `hover`-only link underline, v4 tab sizing (160px min width from `sm` up — it sets the New Game dialog's width), and v4 dialog spacing (`DialogContent` padding, 12px below each `DialogContentText`). Don't remove an override without checking the visual suite.

**Layout.** `App.jsx` centers a `Stack` whose children stretch to the board's width (so the subtitle right-aligns to the board); `Header` is a fragment, so it's wrapped in a `div` to stay one Stack item. The control row is a `Grid` with three `size={4}` columns.

## Conventions

Code is written in a point-free/functional style with Ramda (`import * as R from 'ramda'`); match it when editing utils and hooks.
