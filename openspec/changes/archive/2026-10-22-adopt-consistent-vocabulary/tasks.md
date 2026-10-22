# Tasks

## 1. Glossary and spec wording

- [x] 1.1 Add the `## Glossary` section to `CLAUDE.md` (design Decision 5) and update its Architecture text to the new terms. Add the `context:` line to `openspec/config.yaml`. Change "section" to "box" in `README.md`. Rename the five scenario titles and the two Purpose lines in the main specs and in this change's deltas (Decision 6). Verify that `openspec validate --specs --strict` and `openspec validate adopt-consistent-vocabulary --strict` pass.

## 2. Saved-game migration

- [x] 2.1 Add `src/util/saved-game.js` with `migrateSavedGame` (Decision 1, Ramda style) and `src/util/__tests__/saved-game.test.js`, covering old to new, idempotence, mixed saves, history and future, and kept fields. Apply it in `useBoard` to the stored state. Verify that `npx vitest run` passes.

## 3. Code renames

- [x] 3.1 Switch the stored types to `'given'`/`'player'` and apply every rename in design Decision 2: `src/util`, `src/hooks`, `Cell.jsx`, `Board.jsx`, `theme.js`, `App.jsx`, `NewGameDialog.jsx`, and `git mv src/MiniBoard.jsx src/MiniPuzzle.jsx`. Update the unit tests' identifiers, fixtures, and wording to match. Verify that `npx vitest run` passes, `npm run lint` is clean, `npm run build` succeeds, and grepping `src` finds no `'puzzle'`/`'user'` type strings, `section`, `clue`, or `entered` outside the migration and its tests.

## 4. Tests and Help text

- [x] 4.1 Update `e2e/helpers.js` to write the new format, rename `puzzleValues` to `givenValues`, and bring e2e test titles and comments in line with the glossary. Add the persistence test that old-format saves are rewritten in the new format and reload intact. Verify that `npm run test:e2e` passes, including the v0.2.2 fixture test.
- [x] 4.2 Change the Help text to "puzzle" wording (Decision 3) and add the `app-help` "Puzzle wording" e2e test. Run the visual suite and confirm that only `help.png` differs. Regenerate it, review it, and commit with the reason. Verify that the full `npm run test:e2e` passes.
- [x] 4.3 Bump `package.json` (and `package-lock.json`) to 0.4.0 with `npm version 0.4.0 --no-git-tag-version`. Verify that the Help dialog title reads "soduko v0.4.0" and the `app-help` and visual suites pass.

## 5. Integration check

- [x] 5.1 Run the full gate (`npx vitest run`, `npm run lint`, `npm run build`, `npm run test:e2e`). Load a v0.3.0-format save by hand in `npm start` and confirm that it plays and then saves in the new format. Grep `src`, `e2e`, `openspec/specs`, `README.md`, and `CLAUDE.md` for `clue`, `entered value`, `section`, `'puzzle'`, `'user'`, and "stock board"/"custom board", and expect hits only in the glossary's "replaces" notes, the migration, its tests, and the v0.2.2 fixture. Verify that all pass.

## Workflow follow-up

- Open a PR. Post Help-dialog before/after screenshots with the `pr-screenshots` skill. Merge, which deploys, then archive to sync the seven specs.
