# Design

## Context

See proposal.md for why. Current state:

- 85 Jest tests (CRA 3 / Jest 24) cover `src/util/`. The reducers in `src/hooks/board.js` and `src/hooks/selection.js` are not exported. `useGame` and `useHighlight` are plain functions despite their names: they call no React hooks.
- The DOM has no test hooks. Cells are anonymous `div`s inside a CSS grid, and cell state shows only as computed colors.
- `npm start` and `npm run build` fail on Node ≥17 without `--openssl-legacy-provider` (webpack 4 uses md4).
- The next two changes (`migrate-to-vite-vitest`, `upgrade-runtime-libraries`) replace the build tool, test runner, React, MUI, and styled-components. Every test written here has to survive all of that unchanged.

## Goals / Non-Goals

**Goals:**
- Tests that don't depend on React, MUI, the bundler, or the unit-test runner, so they still apply after every later upgrade.
- Pixel-level detection of visual regressions.
- A real v0.2.2 saved game as a compatibility fixture.

**Non-Goals:**
- Component-level tests with React Testing Library. RTL 9 would have to be rewritten during the upgrade, and the e2e suite covers the same behavior.
- Cross-browser coverage. Chromium only.
- CI setup. No CI exists, and none is added here.
- Fixing existing quirks found while writing tests. Record them; don't change behavior.

## Decisions

**1. Playwright for behavior and visual tests, outside `src/`.**
Tests live in `e2e/*.spec.js` with `playwright.config.js` at the root. Playwright's `webServer` runs `npm start` (`BROWSER=none`, port 3000, `reuseExistingServer`). Playwright drives a real browser through public URLs and DOM events, so swapping CRA→Vite or MUI 4→7 doesn't affect it. Keeping the tests out of `src/` means CRA's Jest (and later Vitest) won't try to run them.
*Alternative:* RTL integration tests in jsdom. Rejected: they'd break during the React/RTL upgrades, and jsdom can't check computed layout or screenshots.

**2. Test hooks via `data-` attributes only.**
Add `data-testid="board"` to the board container and `data-cell="<index>"` (0–80, row-major) to each cell container. These are invisible to users and don't change behavior or layout. Assertions read text content for values and marks, and computed `background-color`/`color` for highlight and error state. Testing colors directly is exactly what `board-appearance` and `cell-selection` specify, and it works whichever styling library is in use.
*Alternative:* select cells with `nth-child` in the grid. Rejected: fragile if the upgrades add wrapper elements.

**3. Seed state through local storage.**
A helper builds the stored state shape (`{ board, history, future }`, with cells `{ type, value }`) from puzzle strings. `page.addInitScript` writes it before load. Most tests seed directly instead of clicking through the New Game dialog. The dialog has its own tests. The "solved" tests seed a known solution with one cell blank.

**4. Visual baselines.**
Use `expect(page).toHaveScreenshot()` in Chromium with a fixed viewport, `animations: 'disabled'`, and the Help dialog's version text masked so the version bump doesn't invalidate it. Use a small tolerance (`maxDiffPixelRatio` ≈ 0.01) to absorb antialiasing noise while still catching color, spacing, or font changes. Baselines are platform-suffixed by Playwright and committed. They're only valid on this Linux machine. That's acceptable for a single maintainer.

**5. Capture the v0.2.2 fixture from the real app.**
A one-off Playwright script (kept as `e2e/capture-fixture.js`, not part of the suite) does the following against the v0.2.2 app (the data attributes from decision 2 do not affect what is stored):
1. Loads a stock puzzle.
2. Enters values and marks.
3. Undoes once.
4. Dumps `localStorage.soduko` to `e2e/fixtures/saved-game-v0.2.2.json`.

The persistence test loads that file. A capture from the real app covers quirks a hand-written fixture would miss (for example, the stray `index: -1` field in the initial state).

**6. Reducer unit tests stay runner-neutral.**
Export the reducers as named exports (`boardReducer`, `selectionReducer`); default exports stay unchanged. Tests go in `src/hooks/__tests__/` and use only `describe`/`it`/`expect`, with no `jest.*` APIs, so they run unchanged under Vitest. `useGame` and `useHighlight` are called directly as functions.

**7. Temporary OpenSSL flag, and the Node pin.**
Prefix the `start`/`build` scripts with `NODE_OPTIONS=--openssl-legacy-provider`. The next change removes it. `.nvmrc` pins Node 24 (current Active LTS). The flag also works on 25, which is installed locally.

## Risks / Trade-offs

- [Playwright's system dependencies on Debian 13 may need root (`install --with-deps`)] → Install only Chromium. If deps are missing, the user runs the printed `apt` command.
- [Screenshots are machine-specific, so font or OS updates can cause false failures] → Regenerate baselines on purpose (`--update-snapshots`) only after confirming the diff is environmental, and record that in the commit message.
- [Drag selection depends on `mouseover` firing for each intermediate cell] → Tests move the mouse explicitly to each cell's center between `down()` and `up()`.
- [The `data-` attributes are a small source change in a "no behavior change" change] → They're attribute-only. The visual baseline suite is captured *after* they're added, and the attributes can't affect rendering.

## Migration Plan

No deploy. Each step is a separate commit: baseline/tooling, unit tests, e2e behavior tests, visual baselines + fixture. Rollback is a git revert. Nothing here affects users.
