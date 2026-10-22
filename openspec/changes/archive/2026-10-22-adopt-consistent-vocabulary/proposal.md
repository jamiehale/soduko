# Proposal

## Why

The specs, code, tests, and on-screen text name the same things differently:
- a given number is a "clue" in the specs but a `'puzzle'` cell in the code
- the player's number is an "entered value" in the specs but a `'user'` cell in the code
- the Help dialog calls a starting pattern a "board", while the README and the New Game dialog call it a "puzzle"
- the 3×3 area is a "section" everywhere, where most players say "box"

The mismatch makes the specs and code harder to read side by side, and it invites new drift with every change.

## What Changes

Adopt one vocabulary and apply it everywhere: specs, code, tests, on-screen text, and docs.

| Term | Meaning | Replaces |
|---|---|---|
| **puzzle** | The starting pattern: a stock puzzle, a custom puzzle, or the mini preview in the New Game dialog | "board" in the Help text |
| **board** | The 81 cells the player interacts with. A new game populates it from a puzzle, then the player adds their values | — |
| **given cell** / **given value** | A cell populated from the puzzle; it can't be changed | "clue", `'puzzle'` cell |
| **player cell** / **player value** | Every other cell; the player sets its value or pencil marks | "entered value", `'user'` cell |
| **box** | One of the nine 3×3 areas | "section" |

Concretely:
- **Saved games:** cells are stored with `type: 'given'` / `'player'` instead of `'puzzle'` / `'user'`. Games saved in the old format are migrated when they load, including the v0.2.2 fixture, so saved progress keeps working.
- **Code:**
  - `isPuzzleCell` → `isGivenCell`, the `isUserCell…` family → `isPlayerCell…`, `setUserValue`/`clearUserValue` → `setPlayerValue`/`clearPlayerValue`
  - `PuzzleCell`/`UserCell` → `GivenCell`/`PlayerCell`, theme colors `puzzle`/`user` → `given`/`player`
  - `sectionFromCount` → `boxFromCount`, `highlightSections` → `highlightBoxes`
  - `MiniBoard.jsx` → `MiniPuzzle.jsx`
  - the `newGame` action carries a `puzzle`, not a `board`
- **Tests:** unit and e2e names, helpers (`puzzleValues` → `givenValues`), and fixtures follow suit.
- **On-screen text:** the Help dialog says "stock puzzle" and "custom puzzle(s)". This is the only visible change; the Help visual baseline is regenerated.
- **Specs:** every requirement that uses the old words is reworded with no change in behavior. "Clue cells are immutable" is renamed "Given cells are immutable".
- **Version:** 0.4.0, because the saved-game format changes. The Help title shows it.
- **Glossary:** a glossary in `CLAUDE.md`, with `openspec/config.yaml` context pointing future artifacts at it.

## Capabilities

### New Capabilities
_None._

### Modified Capabilities
These are reworded with no behavior change, except where noted:
- `board-appearance`: geometry and color requirements use box, given, and player.
- `board-editing`: given/player cells and box. "Clue cells are immutable" is renamed "Given cells are immutable".
- `cell-selection`: peer and value highlighting use box, given, and player.
- `game-persistence`: the default board uses given/player cells. Backward compatibility now migrates old-format saves when they load.
- `game-status`: conflict and solved checks use box and given/player values.
- `puzzle-loading`: puzzle vs board, given values.
- `app-help`: the Help text names starting patterns "puzzles".

## Impact

- `src/util/cell.js`, `src/util/board.js`, `src/hooks/*`, `src/Cell.jsx`, `src/Board.jsx`, `src/theme.js`, `src/NewGameDialog.jsx`, `src/HelpDialog.jsx`, and `src/MiniBoard.jsx` (renamed).
- A new pure migration for saved games, applied in `useBoard` on load.
- `package.json` version 0.4.0.
- All unit tests and e2e specs and helpers. The `help` visual baseline changes.
- `CLAUDE.md`, `README.md`, `openspec/config.yaml`, and all 7 main specs (at archive).
- Returning saves are migrated in place on their first save. There is no way back to an older release's format, but the only saved game is the developer's own.
