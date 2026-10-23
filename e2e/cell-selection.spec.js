const { test, expect } = require('@playwright/test');
const {
  COLORS,
  EMPTY,
  open,
  cell,
  cellState,
  cellBackground,
  drag,
  click,
  settle,
} = require('./helpers');

// Cell 40 is row 4, column 4, box 4. Its peers include 36 (row), 4 (column),
// and 30 (box). Cell 0 shares nothing with it.

const backgrounds = async (page, cells) => {
  const result = {};
  for (const i of cells) {
    result[i] = await cellBackground(page, i);
  }
  return result;
};

test.describe('click to select', () => {
  test('selects one cell', async ({ page }) => {
    await open(page, EMPTY);
    await click(page, 40);
    expect(await backgrounds(page, [40, 41, 0])).toEqual({
      40: COLORS.selected,
      41: COLORS.peer,
      0: COLORS.white,
    });
  });

  test('replaces a previous selection', async ({ page }) => {
    await open(page, EMPTY);
    await drag(page, [0, 1, 2]);
    await click(page, 40);
    expect(await backgrounds(page, [0, 1, 2, 40])).toEqual({
      0: COLORS.white,
      1: COLORS.white,
      2: COLORS.white,
      40: COLORS.selected,
    });
  });
});

test('clicking the only selected cell deselects it', async ({ page }) => {
  await open(page, EMPTY);
  await click(page, 40);
  await click(page, 40);
  expect(await backgrounds(page, [40, 41])).toEqual({ 40: COLORS.white, 41: COLORS.white });
});

test.describe('drag to select', () => {
  test('selects every cell passed over', async ({ page }) => {
    await open(page, EMPTY);
    await drag(page, [0, 1, 2]);
    expect(await backgrounds(page, [0, 1, 2, 3])).toEqual({
      0: COLORS.selected,
      1: COLORS.selected,
      2: COLORS.selected,
      3: COLORS.peer,
    });
  });

  test('shows cells as selected while the drag is in progress', async ({ page }) => {
    await open(page, EMPTY);
    const point = async (i) => {
      const box = await cell(page, i).boundingBox();
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    };
    const start = await point(0);
    const end = await point(1);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 2 });
    await settle(page);
    expect(await backgrounds(page, [0, 1])).toEqual({ 0: COLORS.selected, 1: COLORS.selected });
    await page.mouse.up();
  });

  test('hovering without pressing changes nothing', async ({ page }) => {
    await open(page, EMPTY);
    await click(page, 40);
    await cell(page, 41).hover();
    await cell(page, 0).hover();
    expect(await backgrounds(page, [40, 41, 0])).toEqual({
      40: COLORS.selected,
      41: COLORS.peer,
      0: COLORS.white,
    });
  });
});

test('escape clears the selection without changing the board', async ({ page }) => {
  await open(page, EMPTY, { values: { 40: 5 } });
  await click(page, 40);
  await page.keyboard.press('Escape');
  expect(await backgrounds(page, [40, 41])).toEqual({ 40: COLORS.white, 41: COLORS.white });
  expect((await cellState(page, 40)).value).toBe(5);
});

test.describe('peer highlighting', () => {
  test("a single cell highlights its row, column, and box", async ({ page }) => {
    await open(page, EMPTY);
    await click(page, 40);
    expect(await backgrounds(page, [36, 4, 30, 0, 80])).toEqual({
      36: COLORS.peer,
      4: COLORS.peer,
      30: COLORS.peer,
      0: COLORS.white,
      80: COLORS.white,
    });
  });

  test('cells in one row across boxes highlight only that row', async ({ page }) => {
    await open(page, EMPTY);
    await drag(page, [36, 37, 38, 39, 40, 41, 42]);
    expect(await backgrounds(page, [44, 27, 0, 4])).toEqual({
      44: COLORS.peer,
      27: COLORS.white,
      0: COLORS.white,
      4: COLORS.white,
    });
  });
});

test.describe('value highlighting', () => {
  // 40 and 0 hold 7; 80 (outside every 7's row, column, and box), 36 (peer of 40),
  // and 63 (column 0, projected from the 7 at 0) have mark 7
  const options = { values: { 40: 7, 0: 7 }, marks: { 80: [7], 36: [7], 63: [7], 72: [1] } };

  test('cells with the same value use the selected style', async ({ page }) => {
    await open(page, EMPTY, options);
    await click(page, 40);
    expect(await cellBackground(page, 0)).toBe(COLORS.selected);
  });

  test('non-peer cells with the matching mark use the related style', async ({ page }) => {
    await open(page, EMPTY, options);
    await click(page, 40);
    expect(await backgrounds(page, [80, 36])).toEqual({
      80: COLORS.related,
      36: COLORS.peer,
    });
  });

  test('a struck mark for the value is not related', async ({ page }) => {
    // 70 is row 7, column 7, box 8, outside every 7's areas
    await open(page, EMPTY, { ...options, strikes: { 70: [7] } });
    await click(page, 40);
    expect(await cellBackground(page, 70)).toBe(COLORS.white);
  });

  test('every matching value projects its row, column, and box', async ({ page }) => {
    await open(page, EMPTY, options);
    await click(page, 40);
    // 8 (row 0), 72 (column 0), and 20 (box 0) are peers only of the 7 at 0
    expect(await backgrounds(page, [8, 72, 20])).toEqual({
      8: COLORS.peer,
      72: COLORS.peer,
      20: COLORS.peer,
    });
  });

  test("cells outside every matching value's areas stay unhighlighted", async ({ page }) => {
    await open(page, EMPTY, options);
    await click(page, 40);
    // 70 is row 7, column 7, box 8, with no mark 7
    expect(await cellBackground(page, 70)).toBe(COLORS.white);
  });

  test('filled cells outside the projected areas use the peer style', async ({ page }) => {
    // 61 (row 6, column 7, box 8) holds a player 3; 79 (row 8, column 7) is a given 5
    const puzzle = `${EMPTY.slice(0, 79)}5${EMPTY.slice(80)}`;
    await open(page, puzzle, { ...options, values: { ...options.values, 61: 3 } });
    await click(page, 40);
    expect(await backgrounds(page, [61, 79, 70])).toEqual({
      61: COLORS.peer,
      79: COLORS.peer,
      70: COLORS.white,
    });
  });

  test('an empty selected cell leaves far-off filled cells unhighlighted', async ({ page }) => {
    await open(page, EMPTY, { ...options, values: { ...options.values, 61: 3 } });
    await click(page, 20);
    expect(await cellBackground(page, 61)).toBe(COLORS.white);
  });

  test('a matching mark inside a projected area uses the peer style', async ({ page }) => {
    await open(page, EMPTY, options);
    await click(page, 40);
    expect(await cellBackground(page, 63)).toBe(COLORS.peer);
  });

  test('given values highlight too', async ({ page }) => {
    const puzzle = `7${EMPTY.slice(1, 40)}7${EMPTY.slice(41)}`;
    await open(page, puzzle);
    await click(page, 40);
    expect(await cellBackground(page, 0)).toBe(COLORS.selected);
  });

  test('an empty selected cell highlights no values or marks', async ({ page }) => {
    await open(page, EMPTY, options);
    await click(page, 20);
    expect(await backgrounds(page, [0, 40, 80])).toEqual({
      0: COLORS.peer,
      40: COLORS.white,
      80: COLORS.white,
    });
  });
});

test('errors take precedence over selection', async ({ page }) => {
  await open(page, EMPTY, { values: { 0: 3, 8: 3 } });
  await click(page, 0);
  expect(await backgrounds(page, [0, 8])).toEqual({ 0: COLORS.error, 8: COLORS.error });
});
