const { test, expect } = require('@playwright/test');
const {
  COLORS,
  EMPTY,
  PUZZLE,
  SOLUTION,
  open,
  cellState,
  drag,
  click,
} = require('./helpers');

// In PUZZLE, clue 8 sits at cells 1 and 42; cell 9 is a clue 3 in row 1.
// Cell 2 is a peer of cell 1, and cell 70 is not.

const highlightOptions = {
  values: { 13: 5, 50: 8 },
  marks: { 2: [6, 8], 70: [1, 8], 72: [2, 3] },
};

const openDialog = async (page, button) => {
  await button.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  return dialog;
};

test.describe('board screenshots', () => {
  test('empty board', async ({ page }) => {
    await open(page, EMPTY);
    await expect(page).toHaveScreenshot('empty-board.png');
  });

  test('puzzle with no selection', async ({ page }) => {
    await open(page, PUZZLE, highlightOptions);
    await expect(page).toHaveScreenshot('puzzle.png');
  });

  test('single selection with peer, value, and related highlighting', async ({ page }) => {
    await open(page, PUZZLE, highlightOptions);
    await click(page, 1);
    await expect(page).toHaveScreenshot('single-selection.png');
  });

  test('multi-cell selection', async ({ page }) => {
    await open(page, PUZZLE, highlightOptions);
    await drag(page, [18, 19, 20, 21]);
    await expect(page).toHaveScreenshot('multi-selection.png');
  });

  test('pencil marks', async ({ page }) => {
    await open(page, PUZZLE, {
      marks: {
        0: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        2: [1, 5, 9],
        3: [2, 4, 6, 8],
        5: [7],
      },
    });
    await expect(page).toHaveScreenshot('marks.png');
  });

  test('conflict', async ({ page }) => {
    await open(page, PUZZLE, { values: { 13: 3 } });
    await expect(page).toHaveScreenshot('conflict.png');
  });

  test('solved', async ({ page }) => {
    const puzzle = `${SOLUTION.slice(0, 40)}.${SOLUTION.slice(41)}`;
    await open(page, puzzle, { values: { 40: Number(SOLUTION[40]) } });
    await expect(page.getByText('Solved', { exact: true })).toBeVisible();
    await expect(page).toHaveScreenshot('solved.png');
  });
});

test.describe('dialog screenshots', () => {
  test('new game, stock tab', async ({ page }) => {
    await open(page, PUZZLE);
    await openDialog(page, page.getByRole('button', { name: 'New' }));
    await expect(page).toHaveScreenshot('new-game-stock.png');
  });

  test('new game, stock puzzle list', async ({ page }) => {
    await open(page, PUZZLE);
    const dialog = await openDialog(page, page.getByRole('button', { name: 'New' }));
    await dialog.locator('[aria-haspopup="listbox"]').click();
    await page.getByRole('option').first().waitFor();
    // Keep the pointer off the list so no option shows a hover state
    await page.mouse.move(790, 890);
    await expect(page).toHaveScreenshot('new-game-stock-list.png');
  });

  test('new game, custom tab', async ({ page }) => {
    await open(page, PUZZLE);
    const dialog = await openDialog(page, page.getByRole('button', { name: 'New' }));
    await dialog.getByRole('tab', { name: 'Custom' }).click();
    await dialog.getByRole('textbox').fill(PUZZLE);
    await expect(page).toHaveScreenshot('new-game-custom.png');
  });

  test('reset confirmation', async ({ page }) => {
    await open(page, PUZZLE);
    await openDialog(page, page.getByRole('button', { name: 'Reset' }));
    await expect(page).toHaveScreenshot('reset-confirmation.png');
  });

  test('help, version masked', async ({ page }) => {
    await open(page, PUZZLE);
    const dialog = await openDialog(page, page.getByTestId('help'));
    // Replace the version with a placeholder so version bumps don't change the image
    await dialog.getByText(/^soduko v/).evaluate((el) => {
      el.textContent = 'soduko vX.Y.Z';
    });
    await expect(page).toHaveScreenshot('help.png');
  });
});

test.describe('cell state colors', () => {
  test('text color follows content, background follows state', async ({ page }) => {
    await open(page, PUZZLE, { ...highlightOptions, values: { ...highlightOptions.values, 17: 1 } });
    await click(page, 1);
    const states = {};
    for (const i of [1, 42, 50, 2, 70, 13, 80, 16, 17]) {
      states[i] = await cellState(page, i);
    }
    // Selected clue, same-value clue, same-value entered value
    expect(states[1]).toMatchObject({ background: COLORS.selected, color: COLORS.black });
    expect(states[42]).toMatchObject({ background: COLORS.selected, color: COLORS.black });
    expect(states[50]).toMatchObject({ background: COLORS.selected, color: COLORS.indigo });
    // Peer with the matching mark stays a peer
    expect(states[2]).toMatchObject({ background: COLORS.peer });
    // Related mark
    expect(states[70]).toMatchObject({ background: COLORS.related });
    // A filled cell is blocked for the selected value, but keeps its text color
    expect(states[13]).toMatchObject({ background: COLORS.peer, color: COLORS.indigo });
    // Unhighlighted empty cell
    expect(states[80]).toMatchObject({ background: COLORS.white });
    // Conflicting clue and entered value (both 1 in row 1) keep their text colors
    expect(states[16]).toMatchObject({ background: COLORS.error, color: COLORS.black });
    expect(states[17]).toMatchObject({ background: COLORS.error, color: COLORS.indigo });
  });

  test('pencil marks use the entered-value color', async ({ page }) => {
    await open(page, EMPTY, { marks: { 0: [5] } });
    const color = await page.locator('[data-cell="0"] p').first().evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe(COLORS.indigo);
    expect((await cellState(page, 0)).background).toBe(COLORS.white);
  });
});
