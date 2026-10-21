const { test, expect } = require('@playwright/test');
const {
  COLORS,
  EMPTY,
  PUZZLE,
  SOLUTION,
  open,
  cellBackground,
  click,
} = require('./helpers');

const solved = (page) => page.getByText('Solved', { exact: true });

// The solution with cell 40 blank
const nearlySolved = `${SOLUTION.slice(0, 40)}.${SOLUTION.slice(41)}`;

test.describe('conflict highlighting', () => {
  test('a value repeated in a row marks both cells', async ({ page }) => {
    // Cell 9 is a clue 3 in row 1
    await open(page, PUZZLE);
    await click(page, 13);
    await page.keyboard.press('3');
    expect(await cellBackground(page, 9)).toBe(COLORS.error);
    expect(await cellBackground(page, 13)).toBe(COLORS.error);
  });

  test('a value repeated in a section marks both cells', async ({ page }) => {
    await open(page, EMPTY, { values: { 0: 9, 20: 9 } });
    expect(await cellBackground(page, 0)).toBe(COLORS.error);
    expect(await cellBackground(page, 20)).toBe(COLORS.error);
  });

  test('a value repeated in a column marks both cells', async ({ page }) => {
    await open(page, EMPTY, { values: { 4: 7, 76: 7 } });
    expect(await cellBackground(page, 4)).toBe(COLORS.error);
    expect(await cellBackground(page, 76)).toBe(COLORS.error);
  });

  test('clearing one of the values resolves the conflict', async ({ page }) => {
    await open(page, EMPTY, { values: { 0: 9, 20: 9 } });
    await click(page, 20);
    await page.keyboard.press('9');
    await page.keyboard.press('Escape');
    expect(await cellBackground(page, 0)).toBe(COLORS.white);
    expect(await cellBackground(page, 20)).toBe(COLORS.white);
  });

  test('changing one of the values resolves the conflict', async ({ page }) => {
    await open(page, EMPTY, { values: { 0: 9, 20: 9 } });
    await click(page, 20);
    await page.keyboard.press('4');
    await page.keyboard.press('Escape');
    expect(await cellBackground(page, 0)).toBe(COLORS.white);
    expect(await cellBackground(page, 20)).toBe(COLORS.white);
  });

  test('pencil marks never conflict', async ({ page }) => {
    await open(page, EMPTY, { values: { 0: 4 }, marks: { 1: [4] } });
    expect(await cellBackground(page, 0)).toBe(COLORS.white);
    expect(await cellBackground(page, 1)).toBe(COLORS.white);
  });
});

test.describe('solved indicator', () => {
  test('appears when the last correct value is entered', async ({ page }) => {
    await open(page, nearlySolved);
    await expect(solved(page)).toHaveCount(0);
    await click(page, 40);
    await page.keyboard.press(SOLUTION[40]);
    await expect(solved(page)).toBeVisible();
  });

  test('is absent while a cell is empty', async ({ page }) => {
    await open(page, nearlySolved, { marks: { 40: [1, 2, 3, 4, 5, 6, 7, 8, 9] } });
    await expect(solved(page)).toHaveCount(0);
  });

  test('is absent with a wrong value', async ({ page }) => {
    const wrong = String((Number(SOLUTION[40]) % 9) + 1);
    await open(page, nearlySolved);
    await click(page, 40);
    await page.keyboard.press(wrong);
    await expect(solved(page)).toHaveCount(0);
  });

  test('disappears when the solving move is undone', async ({ page }) => {
    await open(page, nearlySolved);
    await click(page, 40);
    await page.keyboard.press(SOLUTION[40]);
    await expect(solved(page)).toBeVisible();
    await page.getByTestId('undo').click();
    await expect(solved(page)).toHaveCount(0);
  });
});
