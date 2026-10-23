import * as R from 'ramda';
import {
  rowFromCount,
  columnFromCount,
  boxFromCount,
  makeBoard,
  resetBoard,
  allCellsHaveMark,
  boardWithMarkSet,
  boardWithMarkCleared,
  boardWithRelatedMarksCleared,
  boardWithSetValues,
  findBoxSingles,
  nextBulkSet,
  possibleMarks,
  boardWithFilledMarks,
  boardWithToggledMark,
  boardWithToggledStrike,
  boardWithSetValue,
} from '../board';
import { makeCell } from '../cell';

describe('rowFromIndex', () => {
  it('maps to rows', () => {
    R.addIndex(R.forEach)(
      (row, i) => {
        expect(rowFromCount(i)).toBe(row);
      },
      R.flatten(
        R.map(
          R.repeat(R.__, 9),
          R.range(0, 9),
        ),
      ),
    );
  });
})

describe('columnFromCount', () => {
  it('maps to columns', () => {
    R.addIndex(R.forEach)(
      (column, i) => {
        expect(columnFromCount(i)).toBe(column);
      },
      R.flatten(
        R.repeat(
          R.range(0, 9),
          9,
        ),
      ),
    );
  });
});

describe('boxFromCount', () => {
  it('maps to boxes', () => {
    R.addIndex(R.forEach)(
      (box, i) => {
        expect(boxFromCount(i)).toBe(box);
      },
      R.flatten(
        R.map(
          (i) => R.repeat(
            R.flatten(
              R.map(
                R.repeat(R.__, 3),
                R.range(i * 3, i * 3 + 3),
              ),
            ),
            3,
          ),
          R.range(0, 3),
        ),
      ),
    );
  });
});

describe('makeBoard', () => {
  it('creates puzzle cells', () => {
    expect(makeBoard([1, 2, 3])).toStrictEqual([
      { type: 'given', value: 1 },
      { type: 'given', value: 2 },
      { type: 'given', value: 3 },
    ]);
  });

  it('creates player cells', () => {
    expect(makeBoard(['.', '.'])).toStrictEqual([
      { type: 'player', value: [] },
      { type: 'player', value: [] },
    ]);
  });

  it('handles a mix', () => {
    expect(makeBoard([1, 2, '.', 3, '.'])).toStrictEqual([
      { type: 'given', value: 1 },
      { type: 'given', value: 2 },
      { type: 'player', value: [] },
      { type: 'given', value: 3 },
      { type: 'player', value: [] },
    ]);
  });
});

describe('resetBoard', () => {
  it('resets player cells with values', () => {
    expect(resetBoard([
      { type: 'player', value: 3 },
      { type: 'player', value: 5 },
      { type: 'player', value: 7 },
    ])).toStrictEqual([
      { type: 'player', value: [] },
      { type: 'player', value: [] },
      { type: 'player', value: [] },
    ]);
  });

  it('resets player cells with marks', () => {
    expect(resetBoard([
      { type: 'player', value: [1, 2, 3] },
      { type: 'player', value: [4, 5, 6] },
      { type: 'player', value: [7, 8, 9] },
    ])).toStrictEqual([
      { type: 'player', value: [] },
      { type: 'player', value: [] },
      { type: 'player', value: [] },
    ]);
  });

  it('ignores puzzle cells', () => {
    expect(resetBoard([
      { type: 'given', value: 3 },
      { type: 'given', value: 4 },
      { type: 'given', value: 5 },
    ])).toStrictEqual([
      { type: 'given', value: 3 },
      { type: 'given', value: 4 },
      { type: 'given', value: 5 },
    ]);
  });

  it('handles a mix', () => {
    expect(resetBoard([
      { type: 'player', value: 3 },
      { type: 'player', value: [1, 2, 3] },
      { type: 'given', value: 9 },
    ])).toStrictEqual([
      { type: 'player', value: [] },
      { type: 'player', value: [] },
      { type: 'given', value: 9 },
    ]);
  });
});

describe('allCellsHaveMark', () => {
  it('handles a single cell', () => {
    expect(allCellsHaveMark(4, [
      { type: 'player', value: [4] },
    ])).toBe(true);
  });

  it('handles multiple cells', () => {
    expect(allCellsHaveMark(4, [
      { type: 'player', value: [1, 2, 3, 4] },
      { type: 'player', value: [3, 4, 5, 6] },
      { type: 'player', value: [4, 5, 6, 7] },
    ])).toBe(true);
  });

  it('is false if a single cell is missing mark', () => {
    expect(allCellsHaveMark(4, [
      { type: 'player', value: [1, 2, 3, 4] },
      { type: 'player', value: [3, 5, 6] },
      { type: 'player', value: [4, 5, 6, 7] },
    ])).toBe(false);
  });

  it('is true for an empty set', () => {
    expect(allCellsHaveMark(4, [])).toBe(true);
  });
});

describe('boardWithMarkSet', () => {
  let board;
  
  beforeEach(() => {
    board = [
      makeCell('given', 1),
      makeCell('given', 2),
      makeCell('given', 3),
      makeCell('player', [5, 6]),
      makeCell('player', [2, 3]),
      makeCell('given', 6),
      makeCell('given', 7),
      makeCell('player', [4, 5, 6]),
      makeCell('given', 9),
    ];
  });

  it('makes no change to empty set', () => {
    expect(boardWithMarkSet(4, [], board)).toStrictEqual(board);
  });

  it('makes no change to puzzle cells', () => {
    expect(boardWithMarkSet(4, [0, 1, 2, 5, 6], board)).toStrictEqual(board);
  });

  it('marks a single cell', () => {
    expect(boardWithMarkSet(4, [3], board)).toStrictEqual([
      makeCell('given', 1),
      makeCell('given', 2),
      makeCell('given', 3),
      makeCell('player', [4, 5, 6]),
      makeCell('player', [2, 3]),
      makeCell('given', 6),
      makeCell('given', 7),
      makeCell('player', [4, 5, 6]),
      makeCell('given', 9),
    ]);
  });

  it('ignores duplicates', () => {
    expect(boardWithMarkSet(4, [7], board)).toStrictEqual(board);
  });

  it('marks multiple cells', () => {
    expect(boardWithMarkSet(4, [3, 4, 7], board)).toStrictEqual([
      makeCell('given', 1),
      makeCell('given', 2),
      makeCell('given', 3),
      makeCell('player', [4, 5, 6]),
      makeCell('player', [2, 3, 4]),
      makeCell('given', 6),
      makeCell('given', 7),
      makeCell('player', [4, 5, 6]),
      makeCell('given', 9),
    ]);
  });

  it('handles an entire board', () => {
    expect(boardWithMarkSet(4, [0, 1, 2, 3, 4, 5, 6, 7, 8], board)).toStrictEqual([
      makeCell('given', 1),
      makeCell('given', 2),
      makeCell('given', 3),
      makeCell('player', [4, 5, 6]),
      makeCell('player', [2, 3, 4]),
      makeCell('given', 6),
      makeCell('given', 7),
      makeCell('player', [4, 5, 6]),
      makeCell('given', 9),
    ]);
  });
});

describe('boardWithMarkCleared', () => {
  let board;
  
  beforeEach(() => {
    board = [
      makeCell('given', 1),
      makeCell('given', 2),
      makeCell('given', 3),
      makeCell('player', [5, 6]),
      makeCell('player', [2, 3]),
      makeCell('given', 6),
      makeCell('given', 7),
      makeCell('player', [4, 5, 6]),
      makeCell('given', 9),
    ];
  });

  it('makes no change to empty set', () => {
    expect(boardWithMarkCleared(5, [], board)).toStrictEqual(board);
  });

  it('makes no change to puzzle cells', () => {
    expect(boardWithMarkCleared(5, [0, 1, 2, 5, 6], board)).toStrictEqual(board);
  });

  it('clears a single cell', () => {
    expect(boardWithMarkCleared(5, [3], board)).toStrictEqual([
      makeCell('given', 1),
      makeCell('given', 2),
      makeCell('given', 3),
      makeCell('player', [6]),
      makeCell('player', [2, 3]),
      makeCell('given', 6),
      makeCell('given', 7),
      makeCell('player', [4, 5, 6]),
      makeCell('given', 9),
    ]);
  });

  it('ignores cells without a matching mark', () => {
    expect(boardWithMarkCleared(5, [4], board)).toStrictEqual(board);
  });

  it('clears multiple cells', () => {
    expect(boardWithMarkCleared(5, [3, 4, 7], board)).toStrictEqual([
      makeCell('given', 1),
      makeCell('given', 2),
      makeCell('given', 3),
      makeCell('player', [6]),
      makeCell('player', [2, 3]),
      makeCell('given', 6),
      makeCell('given', 7),
      makeCell('player', [4, 6]),
      makeCell('given', 9),
    ]);
  });

  it('handles an entire board', () => {
    expect(boardWithMarkCleared(5, [0, 1, 2, 3, 4, 5, 6, 7, 8], board)).toStrictEqual([
      makeCell('given', 1),
      makeCell('given', 2),
      makeCell('given', 3),
      makeCell('player', [6]),
      makeCell('player', [2, 3]),
      makeCell('given', 6),
      makeCell('given', 7),
      makeCell('player', [4, 6]),
      makeCell('given', 9),
    ]);
  });
});

describe('boardWithRelatedMarksCleared', () => {
  let board;
  let boardToTest;
  
  beforeEach(() => {
    board = [
      makeCell('player', 1),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', 3),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('given', 5),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('given', 7),
      makeCell('player', 4),
      makeCell('player', [2, 3, 4, 5]),

      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),

      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),

      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
      makeCell('player', [2, 3, 4, 5]),
    ];

    boardToTest = boardWithRelatedMarksCleared(4, 7, board);
  });

  it('clears from row', () => {
    [1, 3, 5, 8].forEach((i) => {
      expect(boardToTest[i].value).toStrictEqual([2, 3, 5]);
    });
  });

  it('clears from column', () => {
    [16, 25, 34].forEach((i) => {
      expect(boardToTest[i].value).toStrictEqual([2, 3, 5]);
    });
  });

  it('clears from box', () => {
    [8, 15, 16, 17, 24, 25, 26].forEach((i) => {
      expect(boardToTest[i].value).toStrictEqual([2, 3, 5]);
    });
  });
  
  [
    0,
    // 1, same row
    2,
    // 3, same row
    4,
    // 5, same row
    6,
    7,
    // 8, same row, same box
    9,
    10,
    11,
    12,
    13,
    14,
    // 15, same box
    // 16, same column, same box
    // 17, same box
    18,
    19,
    20,
    21,
    22,
    23,
    // 24, same box
    // 25, same column, same box
    // 26, same box
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    // 34, same column
    35,
  ].forEach((i) => {
    it(`leaves other cells alone (cell ${i})`, () => {
      expect(boardToTest[i]).toStrictEqual(board[i]);
    });
  });
});

const emptyBoard = () => makeBoard(R.repeat('.', 81));

const withMarks = (marks, board) => R.reduce(
  (acc, [cellIndex, cellMarks]) => R.reduce(
    (b, mark) => boardWithMarkSet(mark, [parseInt(cellIndex, 10)], b),
    acc,
    cellMarks,
  ),
  board,
  R.toPairs(marks),
);

const withStrikes = R.curry((strikes, board) => R.reduce(
  (acc, [cellIndex, cellStrikes]) => R.reduce(
    (b, mark) => boardWithToggledStrike(mark, [parseInt(cellIndex, 10)], b),
    acc,
    cellStrikes,
  ),
  board,
  R.toPairs(strikes),
));

describe('findBoxSingles', () => {
  it('finds a digit marked in only one cell of a box', () => {
    const board = withMarks({ 0: [4, 5], 1: [5] }, emptyBoard());
    expect(findBoxSingles(board)).toStrictEqual([{ cellIndex: 0, value: 4 }]);
  });

  it('skips a digit already held as a value in the box', () => {
    const board = R.update(10, makeCell('player', 4), withMarks({ 0: [4] }, emptyBoard()));
    expect(findBoxSingles(board)).toStrictEqual([]);
  });

  it('skips a digit already held by a given cell in the box', () => {
    const board = R.update(10, makeCell('given', 4), withMarks({ 0: [4] }, emptyBoard()));
    expect(findBoxSingles(board)).toStrictEqual([]);
  });

  it('gives no placement when a digit is marked in two cells of a box', () => {
    const board = withMarks({ 0: [4], 20: [4] }, emptyBoard());
    expect(findBoxSingles(board)).toStrictEqual([]);
  });

  it('gives a cell that is single for two digits the lower one', () => {
    const board = withMarks({ 0: [3, 8] }, emptyBoard());
    expect(findBoxSingles(board)).toStrictEqual([{ cellIndex: 0, value: 3 }]);
  });

  it('finds a single pencil mark next to strikes of the same digit', () => {
    const board = withStrikes({ 1: [4], 10: [4] }, withMarks({ 0: [4] }, emptyBoard()));
    expect(findBoxSingles(board)).toStrictEqual([{ cellIndex: 0, value: 4 }]);
  });

  it('does not count a lone strike as a single', () => {
    const board = withStrikes({ 0: [4] }, emptyBoard());
    expect(findBoxSingles(board)).toStrictEqual([]);
  });

  it('returns singles from several boxes, sorted by cell index', () => {
    const board = withMarks({ 80: [2], 40: [7], 0: [4] }, emptyBoard());
    expect(findBoxSingles(board)).toStrictEqual([
      { cellIndex: 0, value: 4 },
      { cellIndex: 40, value: 7 },
      { cellIndex: 80, value: 2 },
    ]);
  });
});

describe('boardWithSetValues', () => {
  it('sets every placement and clears related marks', () => {
    // 2 shares a row with 0; 41 shares a box with 40; 80 is unrelated
    const board = withMarks({ 0: [4], 2: [4, 9], 40: [7], 41: [7], 80: [7] }, emptyBoard());
    const next = boardWithSetValues([{ cellIndex: 0, value: 4 }, { cellIndex: 40, value: 7 }], board);
    expect(next[0]).toStrictEqual(makeCell('player', 4));
    expect(next[40]).toStrictEqual(makeCell('player', 7));
    expect(next[2]).toStrictEqual(makeCell('player', [9]));
    expect(next[41]).toStrictEqual(makeCell('player', []));
    expect(next[80]).toStrictEqual(makeCell('player', [7]));
  });

  it('sets two placements of one digit in a row, leaving a conflict', () => {
    const board = withMarks({ 0: [5], 4: [5] }, emptyBoard());
    const next = boardWithSetValues([{ cellIndex: 0, value: 5 }, { cellIndex: 4, value: 5 }], board);
    expect(next[0]).toStrictEqual(makeCell('player', 5));
    expect(next[4]).toStrictEqual(makeCell('player', 5));
  });
});

describe('nextBulkSet', () => {
  const board = withMarks({ 0: [4] }, emptyBoard());

  it('returns the box singles when there are no conflicts', () => {
    expect(nextBulkSet(board, [])).toStrictEqual([{ cellIndex: 0, value: 4 }]);
  });

  it('returns nothing when the board has a conflict', () => {
    expect(nextBulkSet(board, [30, 31])).toStrictEqual([]);
  });
});

const withValues = R.curry((type, values, board) => R.reduce(
  (acc, [i, value]) => R.update(Number(i), makeCell(type, value), acc),
  board,
  R.toPairs(values),
));

describe('possibleMarks', () => {
  it('leaves out the digits held in the row, column, and box', () => {
    // 3 is in row 0, 27 in column 0, 10 and 20 in box 0; 80 is unrelated
    const board = R.compose(
      withValues('given', { 3: 1, 10: 5 }),
      withValues('player', { 27: 2, 20: 8, 80: 9 }),
    )(emptyBoard());
    expect(possibleMarks(0, board)).toStrictEqual([3, 4, 6, 7, 9]);
  });

  it('gives every digit on an empty board', () => {
    expect(possibleMarks(40, emptyBoard())).toStrictEqual(R.range(1, 10));
  });

  it('gives nothing when every digit is held by a peer', () => {
    const board = withValues('player', { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }, emptyBoard());
    expect(possibleMarks(0, board)).toStrictEqual([]);
  });

  it('counts both values of a conflict', () => {
    const board = withValues('player', { 1: 5, 2: 5 }, emptyBoard());
    expect(possibleMarks(0, board)).toStrictEqual([1, 2, 3, 4, 6, 7, 8, 9]);
  });
});

describe('boardWithFilledMarks', () => {
  it('fills every cell of an empty board with 1 to 9', () => {
    expect(boardWithFilledMarks(emptyBoard())).toStrictEqual(R.repeat(makeCell('player', R.range(1, 10)), 81));
  });

  it('replaces existing marks', () => {
    const board = R.compose(
      withValues('given', { 1: 4 }),
      board => withMarks({ 0: [1, 4], 80: [2] }, board),
    )(emptyBoard());
    const next = boardWithFilledMarks(board);
    expect(next[0]).toStrictEqual(makeCell('player', [1, 2, 3, 5, 6, 7, 8, 9]));
    expect(next[80]).toStrictEqual(makeCell('player', R.range(1, 10)));
  });

  it('leaves given cells and player values unchanged', () => {
    const board = R.compose(
      withValues('given', { 0: 3 }),
      withValues('player', { 40: 6 }),
    )(emptyBoard());
    const next = boardWithFilledMarks(board);
    expect(next[0]).toStrictEqual(makeCell('given', 3));
    expect(next[40]).toStrictEqual(makeCell('player', 6));
    expect(next[41]).toStrictEqual(makeCell('player', [1, 2, 3, 4, 5, 7, 8, 9]));
  });

  it('gives a cell with no possible digit no marks', () => {
    const board = R.compose(
      withValues('player', { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }),
      board => withMarks({ 0: [3, 5] }, board),
    )(emptyBoard());
    expect(boardWithFilledMarks(board)[0]).toStrictEqual(makeCell('player', []));
  });

  it('keeps strikes and does not add struck digits', () => {
    const board = withStrikes({ 0: [3] }, emptyBoard());
    expect(boardWithFilledMarks(board)[0]).toStrictEqual({ type: 'player', value: [1, 2, 4, 5, 6, 7, 8, 9], strikes: [3] });
  });

  it('keeps a strike for a digit a peer holds', () => {
    const board = withValues('given', { 1: 3 }, withStrikes({ 0: [3] }, emptyBoard()));
    expect(boardWithFilledMarks(board)[0]).toStrictEqual({ type: 'player', value: [1, 2, 4, 5, 6, 7, 8, 9], strikes: [3] });
  });
});

describe('boardWithToggledStrike', () => {
  it('adds the strike to every selected empty player cell', () => {
    const next = boardWithToggledStrike(2, [0, 1, 2], emptyBoard());
    expect(R.map(i => next[i], [0, 1, 2])).toStrictEqual(R.repeat({ type: 'player', value: [], strikes: [2] }, 3));
  });

  it('adds the strike to all cells when only some have it', () => {
    const next = boardWithToggledStrike(2, [0, 1, 2], withStrikes({ 0: [2], 1: [2] }, emptyBoard()));
    expect(R.map(i => next[i], [0, 1, 2])).toStrictEqual(R.repeat({ type: 'player', value: [], strikes: [2] }, 3));
  });

  it('removes the strike when every selected empty player cell has it', () => {
    const next = boardWithToggledStrike(2, [0, 1], withStrikes({ 0: [2], 1: [2] }, emptyBoard()));
    expect(R.map(i => next[i], [0, 1])).toStrictEqual(R.repeat(makeCell('player', []), 2));
  });

  it('skips given cells and player values', () => {
    const board = R.compose(
      withValues('given', { 0: 3 }),
      withValues('player', { 1: 6 }),
    )(emptyBoard());
    const next = boardWithToggledStrike(5, [0, 1, 2], board);
    expect(next[0]).toStrictEqual(makeCell('given', 3));
    expect(next[1]).toStrictEqual(makeCell('player', 6));
    expect(next[2]).toStrictEqual({ type: 'player', value: [], strikes: [5] });
  });

  it('keeps other marks and replaces the pencil mark of the same digit', () => {
    const next = boardWithToggledStrike(4, [0], withMarks({ 0: [1, 4] }, emptyBoard()));
    expect(next[0]).toStrictEqual({ type: 'player', value: [1], strikes: [4] });
  });

  it('returns an equal board when no empty player cell is selected', () => {
    const board = withValues('given', { 0: 3 }, emptyBoard());
    expect(boardWithToggledStrike(5, [0], board)).toStrictEqual(board);
  });
});

describe('boardWithToggledMark with strikes', () => {
  it('replaces a strike of the same digit', () => {
    const next = boardWithToggledMark(3, [0], withStrikes({ 0: [3] }, emptyBoard()));
    expect(next[0]).toStrictEqual(makeCell('player', [3]));
  });

  it('treats a strike as unmarked', () => {
    const board = withStrikes({ 2: [7] }, withMarks({ 0: [7], 1: [7] }, emptyBoard()));
    const next = boardWithToggledMark(7, [0, 1, 2], board);
    expect(R.map(i => next[i], [0, 1, 2])).toStrictEqual(R.repeat(makeCell('player', [7]), 3));
  });
});

describe('boardWithSetValue with strikes', () => {
  it('keeps the strikes of related cells', () => {
    const next = boardWithSetValue(6, 0, withStrikes({ 1: [6] }, emptyBoard()));
    expect(next[1]).toStrictEqual({ type: 'player', value: [], strikes: [6] });
  });

  it('replaces the cell\'s own strikes', () => {
    const next = boardWithSetValue(5, 0, withStrikes({ 0: [2, 5] }, emptyBoard()));
    expect(next[0]).toStrictEqual(makeCell('player', 5));
  });
});

describe.each([
  ['pencil marks', boardWithToggledMark, cell => cell.value],
  ['struck marks', boardWithToggledStrike, cell => cell.strikes || []],
])('toggling %s skips digits a peer holds', (_, toggle, marksOf) => {
  it('skips a cell whose row holds the digit', () => {
    const board = withValues('given', { 8: 4 }, emptyBoard());
    expect(toggle(4, [0], board)).toStrictEqual(board);
  });

  it('skips a cell whose column holds the digit', () => {
    const board = withValues('player', { 72: 4 }, emptyBoard());
    expect(toggle(4, [0], board)).toStrictEqual(board);
  });

  it('skips a cell whose box holds the digit', () => {
    const board = withValues('given', { 20: 4 }, emptyBoard());
    expect(toggle(4, [0], board)).toStrictEqual(board);
  });

  it('marks the other cells of a selection', () => {
    // 72 shares a column with 0 only
    const next = toggle(4, [0, 1, 2], withValues('player', { 72: 4 }, emptyBoard()));
    expect(R.map(i => marksOf(next[i]), [0, 1, 2])).toStrictEqual([[], [4], [4]]);
  });

  it('counts both values of a conflict', () => {
    const board = withValues('player', { 3: 2, 4: 2 }, emptyBoard());
    expect(toggle(2, [0, 9], board)[0]).toStrictEqual(makeCell('player', []));
    expect(marksOf(toggle(2, [0, 9], board)[9])).toStrictEqual([2]);
  });

  it('leaves the board unchanged when every selected cell is blocked', () => {
    const board = withValues('given', { 8: 4 }, emptyBoard());
    expect(toggle(4, [0, 1, 2], board)).toStrictEqual(board);
  });
});

describe('removing marks a peer blocks', () => {
  it('removes a pencil mark from every selected cell when every taker has it', () => {
    // 0 is blocked by the 2 at 72 but still has a mark 2 from before it was set
    const board = withValues('player', { 72: 2 }, withMarks({ 0: [2], 1: [2], 2: [2] }, emptyBoard()));
    const next = boardWithToggledMark(2, [0, 1, 2], board);
    expect(R.map(i => next[i].value, [0, 1, 2])).toStrictEqual([[], [], []]);
  });

  it('removes a stale struck mark from a blocked cell in a selection', () => {
    const board = withValues('player', { 72: 6 }, withStrikes({ 0: [6], 1: [6] }, emptyBoard()));
    const next = boardWithToggledStrike(6, [0, 1], board);
    expect(R.map(i => next[i], [0, 1])).toStrictEqual(R.repeat(makeCell('player', []), 2));
  });

  it('removes a stale struck mark from a single blocked cell', () => {
    const board = withValues('player', { 72: 6 }, withStrikes({ 0: [6] }, emptyBoard()));
    expect(boardWithToggledStrike(6, [0], board)[0]).toStrictEqual(makeCell('player', []));
  });
});
