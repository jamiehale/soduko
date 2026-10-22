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
