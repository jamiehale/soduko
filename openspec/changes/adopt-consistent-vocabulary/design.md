# Design

## Context

- **Cells:** `{ type, value }`, with `type` `'puzzle'` (given) or `'user'` (player). `makeBoard` builds a board from a decoded puzzle. `resetBoard` clears `'user'` cells. Predicates live in `src/util/cell.js`: `isPuzzleCell`, `isUserCell`, `isUserCellWithValue`, `isUserCellWithMarks`, `setUserValue`, `clearUserValue`.
- **Saved game:** `useBoard` (`src/hooks/board.js`) reads `{ board, history, future }` from localStorage key `soduko` through `useLocalStorage`, passes it as the reducer's initial state, and saves the state after every change. History and future are arrays of whole boards.
- **Boxes:** `sectionFromCount`, `sameSection` (`src/util/board.js`), `bySection` (`src/hooks/game.js`), and `highlightSections` (`src/hooks/highlight.js`).
- **Rendering:** `Cell.jsx` uses the `PuzzleCell`/`UserCell` styled components and `theme.colors.puzzle`/`user`. `NewGameDialog` imports `MiniBoard.jsx` as `MiniPuzzle`.
- **Help text:** "Start a new game with a stock board, or enter a custom board." "Custom boards should be…" "Stock boards were shamelessly stolen…"
- **Tests:**
  - `e2e/helpers.js` builds saves with `'puzzle'`/`'user'` cells
  - `e2e/fixtures/saved-game-v0.2.2.json` is a real v0.2.2 save, which must never be regenerated
- **OpenSpec deltas** can't rename scenarios or change Purpose. Purpose is edited in the main spec directly, per OpenSpec's own instructions.

## Goals / Non-Goals

**Goals:**
- One word per concept across specs, code, tests, on-screen text, and docs, recorded in a glossary.
- Existing saved games keep working.

**Non-Goals:**
- Renaming "conflict" and the "error" style, "peer", "related", or "selection". They are already consistent, and the glossary records them as they are.
- Changing the localStorage key (`soduko`) or the saved-game shape beyond the cell `type` values.

## Decisions

**1. Stored cell types become `'given'` and `'player'`, with a load-time migration.**
- **Where:** a pure function in a new `src/util/saved-game.js`, `migrateSavedGame`, maps every cell in `board`, `history[*]`, and `future[*]`: `'puzzle'` → `'given'`, `'user'` → `'player'`. Other values are left alone.
- **Behavior:** it is idempotent and keeps any other fields.
- **When it runs:** `useBoard` applies it to the stored state before using it as the reducer's initial state. The existing save effect then writes the new format on the next change.
- *Alternative:* keep the stored values and map names only in code. Rejected: the user wants the names consistent, and the only saved game is the developer's own.
- *Alternative:* migrate inside `useLocalStorage`. Rejected: that hook is generic, and the saved-game format belongs to the board.

**2. Code renames follow the glossary:**

| Old | New |
|---|---|
| `isPuzzleCell` | `isGivenCell` |
| `isUserCell` | `isPlayerCell` |
| `isUserCellWithValue` | `isPlayerCellWithValue` |
| `isUserCellWithMarks` | `isPlayerCellWithMarks` |
| `setUserValue` / `clearUserValue` | `setPlayerValue` / `clearPlayerValue` |
| `PuzzleCell` / `UserCell` | `GivenCell` / `PlayerCell` |
| `theme.colors.puzzle` / `user` | `theme.colors.given` / `player` |
| `sectionFromCount` | `boxFromCount` |
| `sameSection` | `sameBox` |
| `bySection` | `byBox` |
| `highlightSections` | `highlightBoxes` |
| `MiniBoard.jsx` (imported as `MiniPuzzle`) | `MiniPuzzle.jsx` |
| `newGame` payload `{ board }` | `{ puzzle }` |

`makeCell(type, value)` callers pass the new type strings. The `stockPuzzle`/`customPuzzle` names already match the glossary.

**3. Help text uses "puzzle" for starting patterns.** "Start a new game with a stock puzzle, or enter a custom puzzle." "Custom puzzles should be…" "Stock puzzles were shamelessly stolen…" The `help` visual baseline is regenerated. The other screenshots must not change. The PR gets before/after screenshots of the Help dialog through the `pr-screenshots` skill.

**4. Tests.**
- **Unit:**
  - rename identifiers and describe/it texts
  - switch fixtures to the new type strings
  - add `saved-game.test.js`: old types map to new; already-new and mixed saves are unchanged or completed; history and future are covered; other fields are kept
- **E2E:**
  - `helpers.js` writes the new format; `puzzleValues` → `givenValues`
  - the v0.2.2 fixture test stays, as the old-format load test
  - new test: seed a save in the old format, make a change, and assert that the stored game now uses `'given'`/`'player'` and still reloads intact
  - an `app-help` test that the Help text says "stock puzzle" and "custom puzzle" and never "board"
  - test titles and comments use the glossary; snapshot file names stay as they are
- **Fixture:** `e2e/capture-fixture.js` and `fixtures/` are unchanged.

**5. Glossary.**
- **`CLAUDE.md`:**
  - a `## Glossary` section with every term above, plus value, pencil marks, peer, related, conflict, game, and selection, each with its code name and stored value where they differ
  - the Architecture text updated to match
- **`openspec/config.yaml`:** a `context:` line telling artifacts to use the `CLAUDE.md` glossary terms.
- **`README.md`:** "section" → "box".

**6. Spec wording outside the deltas.**
- **Scenario titles:** renamed in the main specs and the deltas together:
  - "Section borders" → "Box borders"
  - "Entered value text" → "Player value text"
  - "Type on a clue cell" → "Type on a given cell"
  - "Marks skip clue cells" → "Marks skip given cells"
  - "Section conflict" → "Box conflict"
- **Purpose lines** (main specs only, since deltas can't carry them): `board-editing` ("Clue cells from the puzzle cannot be changed" → "Given cells cannot be changed") and `cell-selection` ("row/column/section peers" → "row/column/box peers").

**7. Version 0.4.0.**
Bump `package.json` from 0.3.0 to 0.4.0, because the saved-game format changes. The migration doesn't depend on the version; nothing version-related is stored in the save. The bump makes it visible in the Help title which build is live. The Help visual test replaces the version text, so the baseline doesn't depend on it.

## Risks / Trade-offs

- **[An old release can't read a migrated save]** → One-way, accepted. A rollback deploy would show the default board until a new game is started. The only saved game is the developer's own.
- **[A missed rename leaves a stale `'puzzle'`/`'user'` check, and given cells become editable]** → After the change, grep for `'puzzle'`, `'user'`, `section`, `clue`, and `entered` in `src`, `e2e`, and `openspec/specs`, and expect no hits outside the fixture, the migration, and its tests. The e2e "given cells are immutable" scenarios catch a behavioral miss.
- **[Renaming test titles renames snapshot files]** → Screenshot names are passed explicitly (`'help.png'` etc.), so titles can change freely.
