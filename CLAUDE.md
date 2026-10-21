# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sudoku *helper* (not a solver or generator), served at soduko.me (deployed manually). Vite with React 16, Material-UI v4, styled-components, and Ramda. Plain JavaScript, no TypeScript.

## Commands

Use npm (`package-lock.json`); Node version is pinned in `.nvmrc`.

- `npm start` — Vite dev server on http://localhost:3000
- `npm run build` — production build into `build/` (not Vite's default `dist/`; the site is deployed by hand from `build/`)
- `npm run preview` — serve the production build on :3000
- `npm test` — Vitest (watch mode in a terminal; runs once when `CI` is set)
- `npx vitest run` — unit tests once
- `npx vitest run src/hooks/__tests__/board.test.js` — single unit test file
- `npx vitest run -t "name of test"` — unit tests matching a name
- `npm run lint` — ESLint 9 flat config (`eslint.config.js`), tuned to match the old CRA `react-app` rules
- `npm run test:e2e` — Playwright behavior + visual suite (Chromium); starts the dev server itself or reuses one already on :3000
- `npx playwright test e2e/board-editing.spec.js` — single e2e spec; add `-g "test name"` to filter
- `npx playwright test --update-snapshots` — regenerate visual baselines. Only for an intended visual change or a confirmed environment-only diff (font/OS update); review the new PNGs and say why in the commit.

Source files containing JSX use `.jsx`; plain JS stays `.js`. `vite.config.mjs` holds the Vite and Vitest config (`.mjs` because `package.json` is CommonJS, which the Playwright and ESLint configs rely on).

## Tests

- **Unit** (`src/**/__tests__/`): pure `src/util/` functions, the exported `boardReducer`/`selectionReducer`, and `useGame`/`useHighlight` (plain functions, called directly). They use Vitest globals (`describe`/`it`/`expect`); none need a DOM, so Vitest runs in the `node` environment.
- **E2E** (`e2e/*.spec.js`): one spec per capability in `openspec/specs/`, plus `visual.spec.js` (screenshots in `e2e/visual.spec.js-snapshots/`, Linux/Chromium-specific). These are the regression gate for dependency upgrades and must not depend on React/MUI internals.
- DOM hooks for tests: `data-testid="board"`, `data-cell="<index>"` on each cell, and `data-testid` `help`/`undo`/`redo` on the icon buttons. Keep them when refactoring components.
- `e2e/helpers.js` seeds a game by writing the saved-game format to `localStorage` before load (`open(page, puzzle, { values, marks, history, future })`) and reads cell value/marks/colors from the DOM. Assert highlight state through computed colors.
- `e2e/fixtures/saved-game-v0.2.2.json` is a real v0.2.2 save; never regenerate it. `e2e/capture-fixture.js` exists only to capture fixtures for future formats.

## Architecture

**Board model.** A board is a flat array of 81 cells, indexed row-major (`row * 9 + column`). `src/util/board.js` provides `rowFromCount`/`columnFromCount`/`sectionFromCount` to derive position from an index. A cell is `{ type, value }`:
- `type: 'puzzle'` — given clue; `value` is a number; immutable.
- `type: 'user'` — `value` is either a number (entered answer) or an array of pencil marks (sorted, unique).

`src/util/cell.js` holds the cell predicates/transforms; `src/util/board.js` holds pure board transforms (`boardWith…` functions). These are curried Ramda-style. Setting a value toggles it (same value clears it) and clears that mark from related cells in the same row/column/section.

**Puzzle input.** `src/util/decoder.js` turns an 81-char string (`.` or `0` for blanks, whitespace ignored) into an array of numbers and `'.'`, which `makeBoard` converts to cells. Stock puzzles are strings in `src/puzzles/top95.js`.

**State lives in hooks (`src/hooks/`), wired together in `App.jsx`:**
- `board.js` — `useReducer` holding `{ board, history, future }` for undo/redo (history/future are stacks of whole boards). Persisted to `localStorage` under key `soduko` via `local-storage.js`, so changes to the state shape affect returning users' saved games. Exports action-creator helpers (`setCellValue(dispatch, …)`, `undo(dispatch)`, etc.) rather than raw dispatches.
- `selection.js` — mouse down/drag/up selection of cell indices; clicking the single selected cell again deselects.
- `game.js` — derives `isSolved` and `errorCells` (conflicts) from the board each render.
- `highlight.js` — derives which row/column/section/value to highlight from the selection.
- `confirmation.js` — generic confirm-before-action dialog state.
- `logging-reducer.js` — debug wrapper for reducers (not used by default).

**Input semantics** (in `App.jsx` keydown handler): a digit with one selected cell sets its value; with multiple cells selected (or while still dragging) it toggles that pencil mark across them. Escape clears the selection.

**Rendering:** `Board` → `Cell`, which delegates to `MarkedCell` for pencil marks; `hooks/border.js` computes the thicker section borders. `MiniBoard` is the read-only puzzle preview in `NewGameDialog`. Colors and styling tokens come from `src/theme.js` via styled-components' `ThemeProvider`; layout and dialogs use Material-UI.

## Conventions

Code is written in a point-free/functional style with Ramda (`import * as R from 'ramda'`); match it when editing utils and hooks.
