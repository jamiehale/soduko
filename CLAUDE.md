# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sudoku *helper* (not a solver or generator), deployed to Netlify at soduko.me. Create React App (react-scripts 3) with React 16, Material-UI v4, styled-components, and Ramda. Plain JavaScript, no TypeScript.

## Commands

The README documents yarn, but the working tree has moved to npm (`package-lock.json`; `yarn.lock` deleted). Either runs the same CRA scripts.

- `npm start` — dev server on http://localhost:3000
- `npm run build` — production build
- `npm test` — Jest in watch mode (CRA)
- `CI=true npm test` — run tests once, no watch
- `npm test -- src/util/__tests__/board.test.js` — single test file
- `npm test -- -t "name of test"` — tests matching a name

Linting is CRA's built-in `react-app` ESLint config, surfaced during `start`/`build`; there is no separate lint script.

## Architecture

**Board model.** A board is a flat array of 81 cells, indexed row-major (`row * 9 + column`). `src/util/board.js` provides `rowFromCount`/`columnFromCount`/`sectionFromCount` to derive position from an index. A cell is `{ type, value }`:
- `type: 'puzzle'` — given clue; `value` is a number; immutable.
- `type: 'user'` — `value` is either a number (entered answer) or an array of pencil marks (sorted, unique).

`src/util/cell.js` holds the cell predicates/transforms; `src/util/board.js` holds pure board transforms (`boardWith…` functions). These are curried Ramda-style and are where the unit tests live (`src/util/__tests__/`). Setting a value toggles it (same value clears it) and clears that mark from related cells in the same row/column/section.

**Puzzle input.** `src/util/decoder.js` turns an 81-char string (`.` or `0` for blanks, whitespace ignored) into an array of numbers and `'.'`, which `makeBoard` converts to cells. Stock puzzles are strings in `src/puzzles/top95.js`.

**State lives in hooks (`src/hooks/`), wired together in `App.js`:**
- `board.js` — `useReducer` holding `{ board, history, future }` for undo/redo (history/future are stacks of whole boards). Persisted to `localStorage` under key `soduko` via `local-storage.js`, so changes to the state shape affect returning users' saved games. Exports action-creator helpers (`setCellValue(dispatch, …)`, `undo(dispatch)`, etc.) rather than raw dispatches.
- `selection.js` — mouse down/drag/up selection of cell indices; clicking the single selected cell again deselects.
- `game.js` — derives `isSolved` and `errorCells` (conflicts) from the board each render.
- `highlight.js` — derives which row/column/section/value to highlight from the selection.
- `confirmation.js` — generic confirm-before-action dialog state.
- `logging-reducer.js` — debug wrapper for reducers (not used by default).

**Input semantics** (in `App.js` keydown handler): a digit with one selected cell sets its value; with multiple cells selected (or while still dragging) it toggles that pencil mark across them. Escape clears the selection.

**Rendering:** `Board` → `Cell`, which delegates to `MarkedCell` for pencil marks; `hooks/border.js` computes the thicker section borders. `MiniBoard` is the read-only puzzle preview in `NewGameDialog`. Colors and styling tokens come from `src/theme.js` via styled-components' `ThemeProvider`; layout and dialogs use Material-UI.

## Conventions

Code is written in a point-free/functional style with Ramda (`import * as R from 'ramda'`); match it when editing utils and hooks.
