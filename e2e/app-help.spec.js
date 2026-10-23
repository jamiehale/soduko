const { test, expect } = require('@playwright/test');
const { PUZZLE, open, boardValues } = require('./helpers');
const { version } = require('../package.json');

test('help shows the version and usage instructions', async ({ page }) => {
  await open(page);
  await page.getByTestId('help').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(`soduko v${version}`);
  await expect(dialog).toContainText('Click to select a single cell. Click and drag to select multiple cells.');
  await expect(dialog).toContainText('type 1-9 to toggle pencil marks');
  await expect(dialog).toContainText('Hold Shift and type 1-9 to strike out that digit in the selected cells.');
  await expect(dialog).toContainText('With nothing selected, type 1-9 to highlight that digit.');
  await expect(dialog).toContainText('Click the pencil button to fill every empty cell with the pencil marks its row, column, and box allow.');
  await expect(dialog).toContainText('Custom puzzles should be 81 characters long');
  await expect(dialog.getByRole('link', { name: 'http://norvig.com/top95.txt' }))
    .toHaveAttribute('href', 'http://norvig.com/top95.txt');
});

test('help calls starting patterns puzzles, not boards', async ({ page }) => {
  await open(page);
  await page.getByTestId('help').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Start a new game with a stock puzzle, or enter a custom puzzle.');
  await expect(dialog).toContainText('Stock puzzles were shamelessly stolen');
  await expect(dialog).not.toContainText(/board/i);
});

test('okay closes help without changing the game', async ({ page }) => {
  await open(page, PUZZLE, { values: { 0: 5 } });
  const before = await boardValues(page);
  await page.getByTestId('help').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Okay' }).click();
  await expect(dialog).toBeHidden();
  expect(await boardValues(page)).toEqual(before);
});
