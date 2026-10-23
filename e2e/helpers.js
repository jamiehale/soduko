// Shared helpers for the end-to-end suite. They depend only on the DOM hooks
// (`data-testid`, `data-cell`) and the saved-game format in local storage, so
// they keep working across framework and styling-library upgrades.

const STORAGE_KEY = 'soduko';

const COLORS = {
  white: 'rgb(255, 255, 255)',
  black: 'rgb(0, 0, 0)',
  indigo: 'rgb(63, 81, 181)',
  selected: 'rgb(170, 170, 255)',
  peer: 'rgb(221, 221, 255)',
  related: 'rgb(255, 255, 68)',
  error: 'rgb(255, 82, 82)',
};

// The README example puzzle
const PUZZLE = '.8..4....3......1........2...5...4.69..1..8..2...........3.9....6....5.....2.....';

// A valid completed grid: row r is the digits 1-9 shifted by 3r + floor(r / 3)
const SOLUTION = Array.from({ length: 81 }, (_, i) => {
  const row = Math.floor(i / 9);
  return String(((row * 3 + Math.floor(row / 3) + (i % 9)) % 9) + 1);
}).join('');

const EMPTY = '.'.repeat(81);

const index = (row, column) => row * 9 + column;

// Builds a board in the saved-game format from an 81-character puzzle string
// ('.' or '0' blank), plus optional player values, marks, and strikes keyed by cell index.
const buildBoard = (puzzle, { values = {}, marks = {}, strikes = {} } = {}) => puzzle.split('').map((ch, i) => {
  if (ch !== '.' && ch !== '0') {
    return { type: 'given', value: Number(ch) };
  }
  if (values[i] !== undefined) {
    return { type: 'player', value: values[i] };
  }
  const cell = { type: 'player', value: marks[i] || [] };
  return strikes[i] ? { ...cell, strikes: strikes[i] } : cell;
});

const buildState = (puzzle, options = {}) => ({
  board: buildBoard(puzzle, options),
  history: (options.history || []).map((h) => buildBoard(h.puzzle || puzzle, h)),
  future: (options.future || []).map((f) => buildBoard(f.puzzle || puzzle, f)),
});

// Writes raw saved data before the app loads. Runs only on the first page load
// of the test, so reloads see whatever the app itself saved.
const seedRaw = async (page, raw) => {
  await page.addInitScript(([key, value]) => {
    if (!window.sessionStorage.getItem('__seeded')) {
      window.sessionStorage.setItem('__seeded', '1');
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
      }
    }
  }, [STORAGE_KEY, raw]);
};

const seed = (page, state) => seedRaw(page, JSON.stringify(state));

// Seeds a game and opens the app
const open = async (page, puzzle = PUZZLE, options = {}) => {
  await seed(page, buildState(puzzle, options));
  await page.goto('/');
  await page.getByTestId('board').waitFor();
};

const cell = (page, i) => page.locator(`[data-cell="${i}"]`);

// Reads what a cell shows: its value (number or null), its marks, its struck
// marks (told apart by a line-through), and its colors
const cellState = (page, i) => cell(page, i).evaluate((el) => {
  const content = el.firstElementChild;
  const isMarks = content && content.children.length === 9;
  const text = (node) => (node ? node.textContent.trim() : '');
  const textNode = isMarks ? null : content;
  const isStruck = (node) => getComputedStyle(node).textDecorationLine.includes('line-through');
  const digits = (struck) => (isMarks
    ? Array.from(content.children).filter((node) => isStruck(node) === struck).map(text).filter((t) => t !== '').map(Number)
    : []);
  return {
    value: isMarks || text(textNode) === '' ? null : Number(text(textNode)),
    marks: digits(false),
    strikes: digits(true),
    background: getComputedStyle(el).backgroundColor,
    color: textNode ? getComputedStyle(textNode).color : null,
  };
});

const cellValue = async (page, i) => (await cellState(page, i)).value;
const cellMarks = async (page, i) => (await cellState(page, i)).marks;
const cellStrikes = async (page, i) => (await cellState(page, i)).strikes;
const cellBackground = async (page, i) => (await cellState(page, i)).background;

// Waits for a frame plus a task, so React has re-rendered and run its effects
// (the keyboard listener picks up new selection state in an effect) before the
// next input. A person can't type within one frame of a click; a test can.
const settle = (page) => page.evaluate(() => new Promise((resolve) => {
  requestAnimationFrame(() => setTimeout(resolve, 0));
}));

const center = async (page, i) => {
  const box = await cell(page, i).boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

// Presses on the first cell, moves through each following cell's center, and
// releases on the last one
const drag = async (page, cells) => {
  const start = await center(page, cells[0]);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  for (const i of cells.slice(1)) {
    const point = await center(page, i);
    await page.mouse.move(point.x, point.y, { steps: 2 });
  }
  await page.mouse.up();
  await settle(page);
};

const click = async (page, i) => {
  await cell(page, i).click();
  await settle(page);
};

const savedState = (page) => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY);

module.exports = {
  COLORS,
  PUZZLE,
  SOLUTION,
  EMPTY,
  index,
  buildBoard,
  buildState,
  seed,
  seedRaw,
  open,
  cell,
  cellState,
  cellValue,
  cellMarks,
  cellStrikes,
  cellBackground,
  settle,
  drag,
  click,
  savedState,
};

// Reads every cell as [value or null, ...] in index order
const boardValues = (page) => page.locator('[data-cell]').evaluateAll((els) => els.map((el) => {
  const content = el.firstElementChild;
  if (!content || content.children.length === 9) {
    return null;
  }
  return Number(content.textContent.trim());
}));

// The given values a puzzle string puts on the board, in the same shape as boardValues
const givenValues = (puzzle) => puzzle.split('').map((ch) => (ch === '.' || ch === '0' ? null : Number(ch)));

module.exports.boardValues = boardValues;
module.exports.givenValues = givenValues;
