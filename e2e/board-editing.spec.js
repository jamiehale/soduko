const { test, expect } = require('@playwright/test');
const {
  COLORS,
  open,
  cell,
  cellState,
  cellValue,
  cellMarks,
  cellBackground,
  drag,
  click,
  settle,
} = require('./helpers');

// In the default puzzle, cells 1 (8) and 4 (4) are given cells; 0, 2, 3 are empty.

const undoButton = (page) => page.getByTestId('undo');
const redoButton = (page) => page.getByTestId('redo');

test.describe('enter a value in a single selected cell', () => {
  test('sets a value in an empty cell', async ({ page }) => {
    await open(page);
    await click(page, 0);
    await page.keyboard.press('5');
    expect(await cellState(page, 0)).toMatchObject({ value: 5, color: COLORS.indigo });
  });

  test('replaces an existing value', async ({ page }) => {
    await open(page, undefined, { values: { 0: 3 } });
    await click(page, 0);
    await page.keyboard.press('7');
    expect(await cellValue(page, 0)).toBe(7);
  });

  test('does nothing without a selection', async ({ page }) => {
    await open(page);
    await page.keyboard.press('5');
    expect(await cellState(page, 0)).toMatchObject({ value: null, marks: [] });
    await expect(undoButton(page)).toBeDisabled();
  });
});

test('typing the same value clears it', async ({ page }) => {
  await open(page, undefined, { values: { 0: 4 } });
  await click(page, 0);
  await page.keyboard.press('4');
  expect(await cellState(page, 0)).toMatchObject({ value: null, marks: [] });
});

test.describe('given cells are immutable', () => {
  test('typing on a given cell changes nothing and adds no undo step', async ({ page }) => {
    await open(page);
    await click(page, 1);
    await page.keyboard.press('5');
    expect(await cellState(page, 1)).toMatchObject({ value: 8, color: COLORS.black });
    await expect(undoButton(page)).toBeDisabled();
  });

  test('marks skip given cells', async ({ page }) => {
    await open(page);
    await drag(page, [0, 1, 2]);
    await page.keyboard.press('2');
    expect(await cellMarks(page, 0)).toEqual([2]);
    expect(await cellValue(page, 1)).toBe(8);
    expect(await cellMarks(page, 2)).toEqual([2]);
  });
});

test('setting a value clears that mark from related cells only', async ({ page }) => {
  // 2 shares the row with 0, 10 the box, 27 the column; 80 is unrelated
  await open(page, undefined, { marks: { 2: [6], 10: [3, 6], 27: [6], 80: [6] } });
  await click(page, 0);
  await page.keyboard.press('6');
  expect(await cellMarks(page, 2)).toEqual([]);
  expect(await cellMarks(page, 10)).toEqual([3]);
  expect(await cellMarks(page, 27)).toEqual([]);
  expect(await cellMarks(page, 80)).toEqual([6]);
});

test.describe('toggle pencil marks across a selection', () => {
  test('adds a mark to several cells', async ({ page }) => {
    await open(page);
    await drag(page, [2, 3]);
    await page.keyboard.press('2');
    expect(await cellMarks(page, 2)).toEqual([2]);
    expect(await cellMarks(page, 3)).toEqual([2]);
  });

  test('adds the mark to all cells when only some have it', async ({ page }) => {
    await open(page, undefined, { marks: { 5: [2], 6: [2] } });
    await drag(page, [5, 6, 7]);
    await page.keyboard.press('2');
    for (const i of [5, 6, 7]) {
      expect(await cellMarks(page, i)).toEqual([2]);
    }
  });

  test('removes the mark when every selected cell has it', async ({ page }) => {
    await open(page, undefined, { marks: { 5: [2], 6: [2], 7: [2, 3] } });
    await drag(page, [5, 6, 7]);
    await page.keyboard.press('2');
    expect(await cellMarks(page, 5)).toEqual([]);
    expect(await cellMarks(page, 6)).toEqual([]);
    expect(await cellMarks(page, 7)).toEqual([3]);
  });

  test('holding the mouse on one cell marks instead of setting a value', async ({ page }) => {
    await open(page);
    const box = await cell(page, 0).boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await settle(page);
    await page.keyboard.press('8');
    await page.mouse.up();
    expect(await cellState(page, 0)).toMatchObject({ value: null, marks: [8] });
  });

  test('marks display in ascending order in fixed positions', async ({ page }) => {
    await open(page);
    await drag(page, [2, 3]);
    await page.keyboard.press('9');
    await page.keyboard.press('1');
    await page.keyboard.press('5');
    expect(await cellMarks(page, 2)).toEqual([1, 5, 9]);
    const slots = await cell(page, 2).evaluate(
      (el) => Array.from(el.firstElementChild.children).map((c) => c.textContent),
    );
    expect(slots).toEqual(['1', '', '', '', '5', '', '', '', '9']);
  });
});

test.describe('undo and redo', () => {
  test('a fresh game has nothing to undo or redo', async ({ page }) => {
    await open(page);
    await expect(undoButton(page)).toBeDisabled();
    await expect(redoButton(page)).toBeDisabled();
  });

  test('undo restores the previous board and enables redo', async ({ page }) => {
    await open(page);
    await click(page, 0);
    await page.keyboard.press('5');
    await undoButton(page).click();
    expect(await cellValue(page, 0)).toBeNull();
    await expect(redoButton(page)).toBeEnabled();
    await expect(undoButton(page)).toBeDisabled();
  });

  test('redo reapplies the change', async ({ page }) => {
    await open(page);
    await click(page, 0);
    await page.keyboard.press('5');
    await undoButton(page).click();
    await redoButton(page).click();
    expect(await cellValue(page, 0)).toBe(5);
    await expect(redoButton(page)).toBeDisabled();
  });

  test('a new change after undo clears redo', async ({ page }) => {
    await open(page);
    await click(page, 0);
    await page.keyboard.press('5');
    await undoButton(page).click();
    await page.keyboard.press('6');
    expect(await cellValue(page, 0)).toBe(6);
    await expect(redoButton(page)).toBeDisabled();
  });

  test('undo steps through several changes', async ({ page }) => {
    await open(page);
    await click(page, 0);
    await page.keyboard.press('5');
    await click(page, 2);
    await page.keyboard.press('6');
    await undoButton(page).click();
    await undoButton(page).click();
    expect(await cellValue(page, 0)).toBeNull();
    expect(await cellValue(page, 2)).toBeNull();
  });
});

test.describe('reset', () => {
  test('confirmed reset clears progress, history, and selection', async ({ page }) => {
    await open(page, undefined, { values: { 0: 5 }, marks: { 2: [1] }, history: [{}] });
    await click(page, 3);
    await page.getByRole('button', { name: 'Reset' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('This will clear all your progress. Are you sure?');
    await dialog.getByRole('button', { name: 'Reset' }).click();
    await expect(dialog).toBeHidden();
    expect(await cellState(page, 0)).toMatchObject({ value: null, marks: [] });
    expect(await cellMarks(page, 2)).toEqual([]);
    expect(await cellValue(page, 1)).toBe(8);
    await expect(undoButton(page)).toBeDisabled();
    await expect(redoButton(page)).toBeDisabled();
    expect(await cellBackground(page, 3)).toBe(COLORS.white);
  });

  test('cancelled reset changes nothing', async ({ page }) => {
    await open(page, undefined, { values: { 0: 5 }, history: [{}] });
    await page.getByRole('button', { name: 'Reset' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
    expect(await cellValue(page, 0)).toBe(5);
    await expect(undoButton(page)).toBeEnabled();
  });
});
