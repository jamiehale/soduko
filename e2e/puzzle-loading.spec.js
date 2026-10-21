const { test, expect } = require('@playwright/test');
const {
  PUZZLE,
  EMPTY,
  open,
  cellValue,
  click,
  boardValues,
  puzzleValues,
} = require('./helpers');

const STOCK_PUZZLE_1 = '4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......';

const openNewGame = async (page) => {
  await page.getByRole('button', { name: 'New' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('New Game');
  return dialog;
};

const startButton = (dialog) => dialog.getByRole('button', { name: 'Start' });

const chooseCustom = async (dialog, puzzle) => {
  await dialog.getByRole('tab', { name: 'Custom' }).click();
  await dialog.getByRole('textbox').fill(puzzle);
};

test.describe('new game dialog', () => {
  test('opens on the Stock tab', async ({ page }) => {
    await open(page, EMPTY);
    const dialog = await openNewGame(page);
    await expect(dialog.getByRole('tab', { name: 'Stock' })).toHaveAttribute('aria-selected', 'true');
    await expect(dialog.getByRole('tab', { name: 'Custom' })).toHaveAttribute('aria-selected', 'false');
  });

  test('cancel leaves the game unchanged', async ({ page }) => {
    await open(page, PUZZLE, { values: { 0: 5 }, marks: { 2: [1] }, history: [{}] });
    const dialog = await openNewGame(page);
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
    const expected = puzzleValues(PUZZLE);
    expected[0] = 5;
    expect(await boardValues(page)).toEqual(expected);
    await expect(page.getByTestId('undo')).toBeEnabled();
  });
});

test.describe('stock puzzles', () => {
  test('offers 95 numbered puzzles with previews', async ({ page }) => {
    await open(page, EMPTY);
    const dialog = await openNewGame(page);
    await dialog.locator('[aria-haspopup="listbox"]').click();
    const options = page.getByRole('option');
    await expect(options).toHaveCount(95);
    await expect(options.first()).toContainText('1:');
    await expect(options.last()).toContainText('95:');
    await expect(options.first()).toContainText('4');
  });

  test('start is disabled until a puzzle is chosen', async ({ page }) => {
    await open(page, EMPTY);
    const dialog = await openNewGame(page);
    await expect(startButton(dialog)).toBeDisabled();
  });

  test('starts stock puzzle 1', async ({ page }) => {
    await open(page, EMPTY);
    const dialog = await openNewGame(page);
    await dialog.locator('[aria-haspopup="listbox"]').click();
    await page.getByRole('option').first().click();
    await expect(startButton(dialog)).toBeEnabled();
    await startButton(dialog).click();
    await expect(dialog).toBeHidden();
    expect(await boardValues(page)).toEqual(puzzleValues(STOCK_PUZZLE_1));
  });
});

test.describe('custom puzzles', () => {
  test('starts a valid custom puzzle', async ({ page }) => {
    await open(page, EMPTY);
    const dialog = await openNewGame(page);
    await chooseCustom(dialog, PUZZLE);
    await startButton(dialog).click();
    await expect(dialog).toBeHidden();
    expect(await boardValues(page)).toEqual(puzzleValues(PUZZLE));
  });

  test('treats zeros as editable blanks', async ({ page }) => {
    await open(page, EMPTY);
    const dialog = await openNewGame(page);
    await chooseCustom(dialog, PUZZLE.replace(/\./g, '0'));
    await startButton(dialog).click();
    expect(await boardValues(page)).toEqual(puzzleValues(PUZZLE));
    await click(page, 0);
    await page.keyboard.press('5');
    expect(await cellValue(page, 0)).toBe(5);
  });

  test('drops invalid characters', async ({ page }) => {
    await open(page, EMPTY);
    const dialog = await openNewGame(page);
    await dialog.getByRole('tab', { name: 'Custom' }).click();
    const input = dialog.getByRole('textbox');
    await input.pressSequentially('1a2 b3');
    await expect(input).toHaveValue('123');
  });

  test('accepts at most 81 characters', async ({ page }) => {
    await open(page, EMPTY);
    const dialog = await openNewGame(page);
    await dialog.getByRole('tab', { name: 'Custom' }).click();
    const input = dialog.getByRole('textbox');
    await input.pressSequentially(`${PUZZLE}123`);
    await expect(input).toHaveValue(PUZZLE);
  });

  test('start is disabled when too short', async ({ page }) => {
    await open(page, EMPTY);
    const dialog = await openNewGame(page);
    await chooseCustom(dialog, PUZZLE.slice(0, 80));
    await expect(startButton(dialog)).toBeDisabled();
  });
});

test('starting a game clears undo and redo history', async ({ page }) => {
  await open(page, EMPTY, { values: { 0: 5 }, history: [{}], future: [{}] });
  await expect(page.getByTestId('undo')).toBeEnabled();
  const dialog = await openNewGame(page);
  await chooseCustom(dialog, PUZZLE);
  await startButton(dialog).click();
  await expect(page.getByTestId('undo')).toBeDisabled();
  await expect(page.getByTestId('redo')).toBeDisabled();
});
