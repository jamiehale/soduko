const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const {
  COLORS,
  EMPTY,
  PUZZLE,
  open,
  seedRaw,
  cellState,
  cellValue,
  cellMarks,
  cellBackground,
  drag,
  click,
  boardValues,
  puzzleValues,
} = require('./helpers');

const STOCK_PUZZLE_1 = '4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......';

const reload = async (page) => {
  await page.reload();
  await page.getByTestId('board').waitFor();
};

const openRaw = async (page, raw) => {
  await seedRaw(page, raw);
  await page.goto('/');
  await page.getByTestId('board').waitFor();
};

const expectEmptyDefaultBoard = async (page) => {
  expect(await boardValues(page)).toEqual(puzzleValues(EMPTY));
  await expect(page.getByTestId('undo')).toBeDisabled();
  await expect(page.getByTestId('redo')).toBeDisabled();
  await click(page, 0);
  await page.keyboard.press('5');
  expect(await cellValue(page, 0)).toBe(5);
};

test.describe('game state is saved', () => {
  test('values and marks survive a reload, selection does not', async ({ page }) => {
    await open(page, PUZZLE);
    await click(page, 0);
    await page.keyboard.press('5');
    await drag(page, [2, 3]);
    await page.keyboard.press('7');
    await reload(page);
    expect(await cellValue(page, 0)).toBe(5);
    expect(await cellMarks(page, 2)).toEqual([7]);
    expect(await cellMarks(page, 3)).toEqual([7]);
    expect(await cellBackground(page, 2)).toBe(COLORS.white);
  });

  test('undo and redo history survives a reload', async ({ page }) => {
    await open(page, PUZZLE);
    await click(page, 0);
    await page.keyboard.press('5');
    await click(page, 2);
    await page.keyboard.press('6');
    await page.getByTestId('undo').click();
    await reload(page);
    await expect(page.getByTestId('undo')).toBeEnabled();
    await expect(page.getByTestId('redo')).toBeEnabled();
    expect(await cellValue(page, 2)).toBeNull();
    await page.getByTestId('redo').click();
    expect(await cellValue(page, 2)).toBe(6);
  });
});

test.describe('default board', () => {
  test('first visit shows an empty editable board', async ({ page }) => {
    await openRaw(page, null);
    await expectEmptyDefaultBoard(page);
  });

  test('corrupt saved data falls back to the empty board', async ({ page }) => {
    await openRaw(page, '{not json');
    await expectEmptyDefaultBoard(page);
  });
});

test('loads a game saved by v0.2.2', async ({ page }) => {
  const fixture = fs.readFileSync(path.join(__dirname, 'fixtures', 'saved-game-v0.2.2.json'), 'utf8');
  await openRaw(page, fixture);

  const expected = puzzleValues(STOCK_PUZZLE_1);
  expected[1] = 2;
  expect(await boardValues(page)).toEqual(expected);
  expect(await cellMarks(page, 2)).toEqual([1, 7]);
  expect(await cellMarks(page, 3)).toEqual([1, 7]);
  expect(await cellState(page, 0)).toMatchObject({ value: 4, color: COLORS.black });
  expect(await cellState(page, 1)).toMatchObject({ value: 2, color: COLORS.indigo });

  await expect(page.getByTestId('undo')).toBeEnabled();
  await expect(page.getByTestId('redo')).toBeEnabled();

  await page.getByTestId('undo').click();
  expect(await cellMarks(page, 2)).toEqual([1]);

  await page.getByTestId('redo').click();
  await page.getByTestId('redo').click();
  expect(await cellValue(page, 11)).toBe(6);
});
