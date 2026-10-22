---
name: pr-screenshots
description: Post before/after screenshots of user-interface changes to the pull request. Use whenever a PR is opened or updated for a change that alters what the app looks like or how it highlights, lays out, or styles anything (board colors, highlighting, dialogs, layout, theme), or when the user asks for screenshots on a PR.
---

# PR screenshots

The user wants to see UI changes on the PR itself. After the PR exists (and again if the visible behavior changes in a later push), capture the affected states from the base branch and from the PR branch, upload them, and post one comment with a before/after table.

## 1. Pick the states to show

Show the scenarios the change is about, using a real-looking board, not just the minimal e2e seeds. Usually 1 to 4 states. Good sources:
- the change's spec scenarios (`openspec/changes/<name>/specs/`)
- a stock puzzle from `src/puzzles/top95.js` with a cell selected
- any visual baselines the PR changed: `git diff --name-only origin/main...HEAD -- e2e/visual.spec.js-snapshots/`

## 2. Write a temporary capture spec

Put it in the scratchpad, not the repo. It uses `e2e/helpers.js` (`open`, `click`, `drag`, …) to seed and drive each state, and saves each screenshot as `<state>.png` under `process.env.SHOT_DIR`. Clip to the board where that's enough:

```js
const { test } = require('@playwright/test');
const { open, click } = require('./helpers');
const top95 = require('fs').readFileSync('src/puzzles/top95.js', 'utf8').match(/[0-9.]{81}/g);

test('select a placed 4', async ({ page }) => {
  await open(page, top95[0]);
  await click(page, 0);
  await page.getByTestId('board').screenshot({ path: `${process.env.SHOT_DIR}/select-4.png` });
});
```

Each state needs its own `test`: `open()` seeds the saved game only once per page.

## 3. Capture before and after

```bash
.claude/skills/pr-screenshots/capture.sh <spec.js> <outdir> [base-ref]
```

This runs the spec on the working tree (`<outdir>/after/`), then in a temporary worktree of `base-ref` (giving `<outdir>/before/`). By default `base-ref` is where the branch left `origin/main`, so the comparison is still right after the PR has been merged. It stops any dev server on :3000 between runs. Look at every PNG before posting. Each "after" must show what the spec says, and each "before" the old behavior.

## 4. Upload and comment

```bash
.claude/skills/pr-screenshots/upload.sh <pr-number> <outdir>
```

This uploads `before/*.png` and `after/*.png` to the orphan `pr-screenshots` branch under `pr-<n>/<timestamp>/`, and prints a markdown table of raw URLs pinned to the upload commit. Nothing on that branch triggers CI or a deploy. Post the table with `gh pr comment <n> --body-file …`, after a one-line caption per state saying what to look for. Then link the comment for the user.

Posting is outward-facing. If the user didn't ask for screenshots on this PR in this conversation, say what you're about to post first.
