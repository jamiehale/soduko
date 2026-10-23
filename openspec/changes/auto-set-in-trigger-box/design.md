# Design

## Context

- `findBoxSingles(board)` (`src/util/board.js`) scans all nine boxes and returns `[{ cellIndex, value }]`, sorted by cell, one per cell (the lower digit wins).
- `nextBulkSet(board, errorCells)` returns `findBoxSingles(board)`, or `[]` when there are conflicts.
- `useAutoSet` (`src/hooks/auto-set.js`) exposes `start()` and `cancel()`. `start()` schedules `step`, which calls `nextBulkSet` on the latest board, dispatches the placements as one `setMany`, and schedules itself again until a round finds nothing.
- `App.jsx` calls `startAutoSet()` right after `setCellValue` when the keystroke set a value (`isValueSet`), and it knows `cellIndex` there.
- `boxFromCount(cellIndex)` gives a cell's box.
- Most auto-set e2e tests trigger from a cell in one box and expect a single in another, for example `BOX_0_SINGLE`, which sets cell 21 (box 1) to leave a single at cell 0 (box 0).

## Goals / Non-Goals

**Goals:**
- Keep the box-single rule itself (`findBoxSingles`) untouched, and limit only which box's results are used.
- Fix the trigger box once per cascade, in the hook that owns the cascade.

**Non-Goals:**
- No change to when a scan starts, to conflict handling, or to cancelling.
- No per-round tracking of "boxes touched by the last bulk set". The trigger box stays fixed for the whole cascade.

## Decisions

### 1. `nextBulkSet(board, errorCells, box)`

Add a third argument and keep only placements whose `boxFromCount(cellIndex)` equals `box`:

`R.filter(R.propSatisfies(i => boxFromCount(i) === box, 'cellIndex'), findBoxSingles(board))`

The lower-digit rule and sorting come from `findBoxSingles` unchanged. Scanning all nine boxes to keep one is wasteful but trivial at this size, and it keeps a single code path for box singles.

*Alternative:* export the per-box `boxSingles` and dedupe it again. Rejected: it would copy the lower-digit and sort logic into a second place.

### 2. `start(cellIndex)` in `useAutoSet`

`start` takes the set cell's index and computes `box = boxFromCount(cellIndex)` once. `step` closes over it, so every round of that cascade scans the same box. A new `start` (a new value set) cancels the old cascade, as it does today, and brings its own box. `App.jsx` calls `startAutoSet(cellIndex)`.

*Alternative:* pass the box from `App.jsx`. Rejected: the hook already owns the cascade, and a cell index is what the caller naturally has.

### 3. Glossary

In CLAUDE.md, add a "trigger box" row and mention it in the "auto-set" and "cascade" rows.

## Risks / Trade-offs

- [Auto-set now does much less. Singles a value set creates in the same row or column, but another box, are left for the player] → This is the change asked for. Those singles still show as single pencil marks, and highlighting the digit makes them easy to spot.
- [Many e2e seeds have to move into the trigger box] → Each rewritten test keeps its name and what it checks. New tests cover the "left alone" cases, so the old cross-box behavior is checked in reverse rather than dropped.

## Migration Plan

No data migration. Deploy is the normal push to `main`; rollback is reverting the commit.
