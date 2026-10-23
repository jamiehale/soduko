# Design

## Context

- An empty player cell is `{ type: 'player', value: [marks] }`; a cell with a value has a number in `value`. Marks are sorted and unique. `cellHasMark` reads only `value`.
- `cellHasMark` is what the related highlight (`Board.jsx`'s `highlightLevel`) and box-single search (`findBoxSingles`) use, so anything kept outside `value` is ignored by both today.
- `setPlayerValue` and `clearPlayerValue` are `R.assoc('value', …)`, so they keep any other keys on the cell.
- `boardWithFilledMarks` rebuilds each empty player cell with `makeCell('player', possibleMarks(i, board))`, and the `fillMarks` reducer action uses `R.equals` to skip no-op fills.
- The `keydown` handler in `App.jsx` matches `event.key` against `'1'`–`'9'`. With Shift held on a US layout, `event.key` is `!`, `@`, and so on; `event.code` stays `Digit1`–`Digit9`.
- `e2e/helpers.js` reads marks as the text of a cell's nine mark slots and seeds games in the saved-game format.

## Goals / Non-Goals

**Goals:**
- Old saves, existing unit-test fixtures, and the e2e seed format stay valid without migration.
- Highlighting and box singles need no code change: they keep reading only pencil marks.
- Keep the new transforms pure, curried, and in the Ramda style of `src/util/`.

**Non-Goals:**
- No change to `migrateSavedGame`.
- No change to conflict detection or the solved check (they read only values).

## Decisions

### 1. An optional `strikes` list on empty player cells

An empty player cell may carry `strikes`: the struck digits, sorted and unique, never overlapping its `value` marks. A missing key means none. The key is removed whenever the list becomes empty, so a cell with no struck marks is exactly `{ type: 'player', value: [...] }` as before.

New helpers in `src/util/cell.js`: `getCellStrikes` (`R.propOr([], 'strikes')`), `cellHasStrike`, `setStrike` (adds N, removes mark N), and `clearStrike` (removes N, drops the key when empty). Changes to existing helpers:
- `setMark` also removes strike N.
- `setPlayerValue` and `clearPlayerValue` drop the `strikes` key.
- `clearMark` is unchanged.

Glossary term: **struck mark**, `strikes` in code. Added to CLAUDE.md.

*Alternatives:*
- Store struck marks as negative numbers in `value`: no new key, but every reader of `value` would have to know about it, and it's hard to read.
- Always-present `strikes: []`: simpler reads, but it changes `makeBoard`, `resetBoard`, every fixture, and old saves would need `migrateSavedGame`. The optional key avoids all of that.

### 2. Board transforms

- `boardWithToggledStrike(mark, cellIndices, board)` mirrors `boardWithToggledMark`: if every selected empty player cell has strike N, clear it from them; otherwise set it on them. Generalize the private `allMarkableCellsHaveMark` to take a predicate (`cellHasMark` or `cellHasStrike`) rather than copy it.
- `boardWithToggledMark` needs no change: its "all have mark" test already treats strike N as unmarked, and its set path goes through `setMark`, which now removes strike N.
- `boardWithFilledMarks` sets `value` to `R.difference(possibleMarks(i, board), getCellStrikes(cell))` with `R.assoc` instead of `makeCell`, so the strikes stay. The no-op check in the reducer still works.
- `boardWithRelatedMarksCleared` and `findBoxSingles` need no change. Value sets leave peers' strikes alone (spec: "Setting a value keeps struck marks in related cells").

### 3. `toggleStrike` reducer action

`{ type: 'toggleStrike', payload: { cells, mark } }` with helper `toggleCellStrike(dispatch, cells, mark)`. One history entry, `future` cleared. Like `fillMarks`, it returns `state` unchanged when the board doesn't change, so a toggle on only given or filled cells adds no undo step.

### 4. Shift + digit in `App.jsx`

The handler checks `event.shiftKey` and `event.code` matching `Digit1`–`Digit9` first and returns after handling it, so it never falls through to the value/mark branch. With any selection (including the drag cells while the mouse is held), it calls `cancelAutoFill()` then `toggleCellStrike`. It never calls `startAutoFill()`.

`event.code` is the physical key, so this works on any layout (spec). The numpad is left out: Shift+numpad digits act as navigation keys on many systems.

### 5. Rendering

`Cell` passes `getCellStrikes(cell)` to `MarkedCell`. For each digit slot, `MarkedCell` renders the mark, a struck mark, or an empty `div`. The struck mark is the same `Mark` with a `$struck` transient prop (per CLAUDE.md, no unknown props reach the DOM) that adds `text-decoration: line-through` with the line color from a new theme token, `colors.strike.line: '#ff0000'`. The text stays `colors.mark.text`. A 2px `text-decoration-thickness` keeps the line visible at 0.75rem.

### 6. Tests and test helpers

- `e2e/helpers.js`:
  - `buildBoard` accepts `strikes` keyed by cell index, written only when given.
  - `cellState` splits a cell's slots by computed `text-decoration-line`: `marks` (no line, as before) and a new `strikes`.
  - a `cellStrikes` shortcut.

  Asserting through computed style matches how the suite already checks colors and doesn't depend on component internals.
- Unit: the cell helpers in `cell.test.js`, the transforms and `findBoxSingles` with strikes in `util/__tests__/board.test.js`, the reducer action in `hooks/__tests__/board.test.js`. Related highlight is computed in `Board.jsx`, so it's covered in e2e.
- Visual: a new `struck-marks.png` baseline with pencil marks and struck marks in nearby cells, one of them under related highlighting. `help.png` is regenerated for the new sentence. Every other baseline must pass unchanged.

## Risks / Trade-offs

- [On layouts such as French AZERTY, digits need Shift, so the player types digits with Shift held. With this change those keys toggle struck marks and no longer set values.] → Today's digit check uses `event.key`, so those layouts already behave oddly. Out of scope; note it in the PR.
- [A struck mark can stay on a digit a peer now holds, and Fill pencil marks keeps it] → This is what the player asked for; it's harmless, since that digit can't be a pencil mark there anyway.
- [Rolling back to v0.6.0 with a save that has `strikes`] → Older code ignores the key, so the struck marks just disappear from view. The board loads and works.
- [An `R.assoc`-based transform added later could leave `strikes` on a cell with a value] → `setPlayerValue`/`clearPlayerValue` drop it, and unit tests check that.

## Migration Plan

No data migration. Deploy is the normal push to `main`; rollback is reverting the commit.
