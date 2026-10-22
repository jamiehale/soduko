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
  boardValues,
  givenValues,
  PUZZLE,
  EMPTY,
} = require('./helpers');

// In the default puzzle, cells 1 (8) and 4 (4) are given cells; 0, 2, 3 are empty.

// Installs the clock, seeds the game, and selects a cell while time still
// flows. Then the clock is paused, so each 500ms step is run by hand.
const openAndSelect = async (page, cellIndex, options, puzzle) => {
  await page.clock.install();
  await open(page, puzzle, options);
  await click(page, cellIndex);
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
};

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

test.describe('auto-fill box singles', () => {
  // Box 0 holds cells 0, 2, 10, 11, 18, 19, 20 (empty) and givens 8 and 3.
  // Setting 21 (row 2, box 1) to 7 clears mark 7 from 20, leaving 0 as box 0's only 7.
  const BOX_0_SINGLE = { 0: [7], 20: [7] };

  test('fills a box single 500ms after the player sets a value', async ({ page }) => {
    await openAndSelect(page, 21, { marks: BOX_0_SINGLE });
    await page.keyboard.press('7');
    expect(await cellMarks(page, 20)).toEqual([]);
    expect(await cellState(page, 0)).toMatchObject({ value: null, marks: [7] });
    await page.clock.runFor(499);
    expect(await cellMarks(page, 0)).toEqual([7]);
    await page.clock.runFor(1);
    expect(await cellState(page, 0)).toMatchObject({ value: 7, color: COLORS.indigo });
  });

  test('fills box singles across the board together', async ({ page }) => {
    // 21 also clears mark 7 from 30 (same column), leaving 40 as box 4's only 7
    await openAndSelect(page, 21, { marks: { ...BOX_0_SINGLE, 30: [7], 40: [7] } });
    await page.keyboard.press('7');
    await page.clock.runFor(499);
    expect(await cellValue(page, 0)).toBeNull();
    expect(await cellValue(page, 40)).toBeNull();
    await page.clock.runFor(1);
    expect(await cellValue(page, 0)).toBe(7);
    expect(await cellValue(page, 40)).toBe(7);
  });

  test('fills a box single that existed before the value set', async ({ page }) => {
    await openAndSelect(page, 0, { marks: { 80: [7] } });
    await page.keyboard.press('5');
    await page.clock.runFor(500);
    expect(await cellValue(page, 80)).toBe(7);
  });

  test('skips a digit the box already holds', async ({ page }) => {
    // box 0 holds the given 3
    await openAndSelect(page, 80, { marks: { 0: [3] } });
    await page.keyboard.press('1');
    await page.clock.runFor(1000);
    expect(await cellState(page, 0)).toMatchObject({ value: null, marks: [3] });
  });

  test('toggling a value off does not fill', async ({ page }) => {
    await openAndSelect(page, 80, { values: { 80: 1 }, marks: { 0: [7] } });
    await page.keyboard.press('1');
    await page.clock.runFor(1000);
    expect(await cellValue(page, 80)).toBeNull();
    expect(await cellMarks(page, 0)).toEqual([7]);
  });

  test('toggling marks does not fill', async ({ page }) => {
    await page.clock.install();
    await open(page, undefined, { marks: BOX_0_SINGLE });
    const box = await cell(page, 20).boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await settle(page);
    await page.keyboard.press('7');
    await page.mouse.up();
    await settle(page);
    expect(await cellMarks(page, 20)).toEqual([]);
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 100));
    await page.clock.runFor(1000);
    expect(await cellMarks(page, 0)).toEqual([7]);
  });

  test('a value set with no box singles is the only undo step', async ({ page }) => {
    await openAndSelect(page, 0);
    await page.keyboard.press('5');
    await page.clock.runFor(1000);
    await undoButton(page).click();
    expect(await cellValue(page, 0)).toBeNull();
    await expect(undoButton(page)).toBeDisabled();
  });

  test('auto-filled values clear related marks', async ({ page }) => {
    // 7 and 8 share box 2, so neither is single for 7 (17 keeps 9 from being single); filling 0 clears 7 from both
    await openAndSelect(page, 21, { marks: { ...BOX_0_SINGLE, 7: [7], 8: [7, 9], 17: [9] } });
    await page.keyboard.press('7');
    await page.clock.runFor(500);
    expect(await cellValue(page, 0)).toBe(7);
    expect(await cellMarks(page, 7)).toEqual([]);
    expect(await cellMarks(page, 8)).toEqual([9]);
  });

  test('a cell single for two digits takes the lower one', async ({ page }) => {
    await openAndSelect(page, 80, { marks: { 0: [5, 6] } });
    await page.keyboard.press('1');
    await page.clock.runFor(500);
    expect(await cellValue(page, 0)).toBe(5);
  });

  test.describe('cascade', () => {
    // Filling 0 with 7 clears mark 7 from 6, leaving 15 as box 2's only 7
    const CASCADE = { ...BOX_0_SINGLE, 6: [7], 15: [7] };

    test('a second round fills 500ms after the first, then the cascade ends', async ({ page }) => {
      await openAndSelect(page, 21, { marks: CASCADE });
      await page.keyboard.press('7');
      await page.clock.runFor(500);
      expect(await cellValue(page, 0)).toBe(7);
      expect(await cellMarks(page, 15)).toEqual([7]);
      await page.clock.runFor(499);
      expect(await cellValue(page, 15)).toBeNull();
      await page.clock.runFor(1);
      expect(await cellValue(page, 15)).toBe(7);
      const before = await boardValues(page);
      await page.clock.runFor(2000);
      expect(await boardValues(page)).toEqual(before);
    });

    test('each round is one undo step', async ({ page }) => {
      await openAndSelect(page, 21, { marks: CASCADE });
      await page.keyboard.press('7');
      await page.clock.runFor(1000);
      await undoButton(page).click();
      expect(await cellMarks(page, 15)).toEqual([7]);
      expect(await cellValue(page, 0)).toBe(7);
      await undoButton(page).click();
      expect(await cellMarks(page, 0)).toEqual([7]);
      expect(await cellMarks(page, 6)).toEqual([7]);
      expect(await cellValue(page, 21)).toBe(7);
      await undoButton(page).click();
      expect(await cellValue(page, 21)).toBeNull();
      expect(await cellMarks(page, 20)).toEqual([7]);
      await expect(undoButton(page)).toBeDisabled();
    });
  });

  test('undo twice returns to before the player set the value', async ({ page }) => {
    await openAndSelect(page, 21, { marks: BOX_0_SINGLE });
    await page.keyboard.press('7');
    await page.clock.runFor(1000);
    await undoButton(page).click();
    await undoButton(page).click();
    expect(await cellValue(page, 21)).toBeNull();
    expect(await cellMarks(page, 0)).toEqual([7]);
    expect(await cellMarks(page, 20)).toEqual([7]);
    await expect(undoButton(page)).toBeDisabled();
  });

  test('redo reapplies a round without starting a cascade', async ({ page }) => {
    await openAndSelect(page, 21, { marks: BOX_0_SINGLE });
    await page.keyboard.press('7');
    await page.clock.runFor(500);
    await undoButton(page).click();
    expect(await cellMarks(page, 0)).toEqual([7]);
    await redoButton(page).click();
    expect(await cellValue(page, 0)).toBe(7);
    await expect(redoButton(page)).toBeDisabled();
    // undo past the player's set, then redo it: 0 is a box single again, but redo doesn't fill it
    await undoButton(page).click();
    await undoButton(page).click();
    await redoButton(page).click();
    expect(await cellValue(page, 21)).toBe(7);
    await page.clock.runFor(1000);
    expect(await cellMarks(page, 0)).toEqual([7]);
    await expect(redoButton(page)).toBeEnabled();
  });

  test.describe('conflicts', () => {
    // 0 and 6 are the only 5s in boxes 0 and 2, but share row 0. Filling 6
    // clears mark 5 from 51, leaving 52 as box 5's only 5.
    const CONFLICT = { 0: [5], 6: [5], 51: [5], 52: [5] };

    test('a round that creates a conflict shows it and stops the cascade', async ({ page }) => {
      await openAndSelect(page, 80, { marks: CONFLICT });
      await page.keyboard.press('1');
      await page.clock.runFor(500);
      expect(await cellState(page, 0)).toMatchObject({ value: 5, background: COLORS.error });
      expect(await cellState(page, 6)).toMatchObject({ value: 5, background: COLORS.error });
      expect(await cellMarks(page, 51)).toEqual([]);
      await page.clock.runFor(1000);
      expect(await cellState(page, 52)).toMatchObject({ value: null, marks: [5] });
    });

    test('undo removes the conflict', async ({ page }) => {
      await openAndSelect(page, 80, { marks: CONFLICT });
      await page.keyboard.press('1');
      await page.clock.runFor(500);
      await undoButton(page).click();
      expect(await cellState(page, 0)).toMatchObject({ value: null, marks: [5] });
      expect(await cellState(page, 6)).toMatchObject({ value: null, marks: [5] });
      expect(await cellBackground(page, 0)).not.toBe(COLORS.error);
      expect(await cellBackground(page, 6)).not.toBe(COLORS.error);
      expect(await cellMarks(page, 51)).toEqual([5]);
    });

    test('no cascade after a player value set that leaves a conflict', async ({ page }) => {
      // row 0 already holds the given 8
      await openAndSelect(page, 0, { marks: { 80: [7] } });
      await page.keyboard.press('8');
      expect(await cellBackground(page, 0)).toBe(COLORS.error);
      await page.clock.runFor(1000);
      expect(await cellMarks(page, 80)).toEqual([7]);
    });
  });

  test.describe('cancelling', () => {
    // 80 is box 8's only 7 before the player's set
    const PENDING = { marks: { 80: [7] } };

    test('undo during the pause cancels the cascade', async ({ page }) => {
      await openAndSelect(page, 0, PENDING);
      await page.keyboard.press('5');
      await page.clock.runFor(200);
      await undoButton(page).click();
      expect(await cellValue(page, 0)).toBeNull();
      await page.clock.runFor(1000);
      expect(await cellMarks(page, 80)).toEqual([7]);
    });

    test('a mark toggle during the pause cancels the cascade', async ({ page }) => {
      await openAndSelect(page, 0, PENDING);
      await page.keyboard.press('5');
      await page.clock.runFor(100);
      const box = await cell(page, 2).boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.clock.runFor(100);
      await page.keyboard.press('9');
      await page.mouse.up();
      expect(await cellMarks(page, 2)).toEqual([9]);
      await page.clock.runFor(1000);
      expect(await cellMarks(page, 80)).toEqual([7]);
    });

    test('a selection change during the pause does not cancel it', async ({ page }) => {
      await openAndSelect(page, 0, PENDING);
      await page.keyboard.press('5');
      await page.clock.runFor(200);
      await cell(page, 40).click();
      await page.clock.runFor(300);
      expect(await cellValue(page, 80)).toBe(7);
    });
  });
});

test.describe('fill pencil marks', () => {
  // In the default puzzle, cell 0 sees 8 and 4 in its row, 3, 9, and 2 in its
  // column, and 8 and 3 in its box, so its possible digits are 1, 5, 6, 7.
  const fillButton = (page) => page.getByTestId('fill-marks');

  const fill = async (page) => {
    await fillButton(page).click();
    await settle(page);
  };

  // Reads every cell's marks in index order, or null for a cell with a value
  const boardMarks = (page) => page.locator('[data-cell]').evaluateAll((els) => els.map((el) => {
    const content = el.firstElementChild;
    if (!content || content.children.length !== 9) {
      return null;
    }
    return Array.from(content.children).map((c) => c.textContent.trim()).filter((t) => t !== '').map(Number);
  }));

  const peers = (i) => Array.from({ length: 81 }, (_, j) => j).filter((j) => j !== i && (
    Math.floor(j / 9) === Math.floor(i / 9)
    || j % 9 === i % 9
    || (Math.floor(j / 27) === Math.floor(i / 27) && Math.floor((j % 9) / 3) === Math.floor((i % 9) / 3))
  ));

  // The only 4s are outside box 0, in rows 1 and 2 and columns 1 and 2, so a
  // fill leaves cell 0 as box 0's only cell with pencil mark 4.
  const BOX_SINGLE = EMPTY.split('').map((ch, i) => ([13, 25, 37, 65].includes(i) ? '4' : ch)).join('');

  test('marks follow the row, column, and box', async ({ page }) => {
    await open(page);
    await fill(page);
    expect(await cellMarks(page, 0)).toEqual([1, 5, 6, 7]);
  });

  test('fills every empty cell and leaves given cells alone', async ({ page }) => {
    await open(page);
    await fill(page);
    expect(await boardValues(page)).toEqual(givenValues(PUZZLE));
    const marks = await boardMarks(page);
    givenValues(PUZZLE).forEach((value, i) => {
      if (value === null) {
        expect(marks[i].length, `cell ${i}`).toBeGreaterThan(0);
      }
    });
  });

  test('player values count and are kept', async ({ page }) => {
    await open(page, PUZZLE, { values: { 13: 6 } });
    await fill(page);
    expect(await cellValue(page, 13)).toBe(6);
    const marks = await boardMarks(page);
    peers(13).filter((i) => marks[i] !== null).forEach((i) => {
      expect(marks[i], `cell ${i}`).not.toContain(6);
    });
  });

  test('an empty board gets every digit everywhere', async ({ page }) => {
    await open(page, EMPTY);
    await fill(page);
    expect(await boardMarks(page)).toEqual(Array(81).fill([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  });

  test('keeps the selection', async ({ page }) => {
    await open(page);
    await drag(page, [0, 2]);
    await fill(page);
    expect(await cellBackground(page, 0)).toBe(COLORS.selected);
    expect(await cellBackground(page, 2)).toBe(COLORS.selected);
  });

  test('replaces existing marks', async ({ page }) => {
    // 8 is in cell 0's row; 1 is missing
    await open(page, PUZZLE, { marks: { 0: [5, 8] } });
    await fill(page);
    expect(await cellMarks(page, 0)).toEqual([1, 5, 6, 7]);
  });

  test('a cell with no possible digit gets no marks', async ({ page }) => {
    // With 1, 5, 6, 7 in its row, cell 0 sees every digit
    await open(page, PUZZLE, { values: { 2: 1, 3: 5, 5: 6, 6: 7 }, marks: { 0: [3, 5] } });
    await fill(page);
    expect(await cellMarks(page, 0)).toEqual([]);
    expect((await cellMarks(page, 80)).length).toBeGreaterThan(0);
  });

  test('works with a conflict, which still shows', async ({ page }) => {
    await open(page, PUZZLE, { values: { 3: 5, 5: 5 } });
    await fill(page);
    expect(await cellBackground(page, 3)).toBe(COLORS.error);
    expect(await cellBackground(page, 5)).toBe(COLORS.error);
    for (const i of [0, 2, 6, 7, 8]) {
      expect(await cellMarks(page, i), `cell ${i}`).not.toContain(5);
    }
  });

  test('is one undo step, and redo reapplies it', async ({ page }) => {
    await open(page, PUZZLE, { marks: { 0: [2, 8], 80: [1] } });
    const before = await boardMarks(page);
    await fill(page);
    const filled = await boardMarks(page);
    await undoButton(page).click();
    expect(await boardMarks(page)).toEqual(before);
    await expect(undoButton(page)).toBeDisabled();
    await redoButton(page).click();
    expect(await boardMarks(page)).toEqual(filled);
  });

  test('a second fill changes nothing and adds no undo step', async ({ page }) => {
    await open(page);
    await fill(page);
    await fill(page);
    await undoButton(page).click();
    expect(await cellMarks(page, 0)).toEqual([]);
    await expect(undoButton(page)).toBeDisabled();
  });

  test('clears redo', async ({ page }) => {
    await open(page);
    await click(page, 0);
    await page.keyboard.press('5');
    await undoButton(page).click();
    await expect(redoButton(page)).toBeEnabled();
    await fill(page);
    await expect(redoButton(page)).toBeDisabled();
  });

  test('does not start auto-fill', async ({ page }) => {
    await openAndSelect(page, 80, {}, BOX_SINGLE);
    await fillButton(page).click();
    expect(await cellMarks(page, 0)).toContain(4);
    await page.clock.runFor(1000);
    expect(await boardValues(page)).toEqual(givenValues(BOX_SINGLE));
  });

  test('cancels a pending auto-fill', async ({ page }) => {
    await openAndSelect(page, 80, {}, BOX_SINGLE);
    await page.keyboard.press('5');
    await page.clock.runFor(200);
    await fillButton(page).click();
    await page.clock.runFor(1000);
    expect(await cellValue(page, 0)).toBeNull();
    expect(await cellValue(page, 80)).toBe(5);
  });
});
