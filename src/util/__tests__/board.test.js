import * as R from 'ramda';
import {
  rowFromCount,
  columnFromCount,
  sectionFromCount,
  makeBoard,
  resetBoard,
  allCellsHaveMark,
  boardWithMarkSet,
  boardWithMarkCleared,
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

describe('sectionFromCount', () => {
  it('maps to sections', () => {
    R.addIndex(R.forEach)(
      (section, i) => {
        expect(sectionFromCount(i)).toBe(section);
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
      { type: 'puzzle', value: 1 },
      { type: 'puzzle', value: 2 },
      { type: 'puzzle', value: 3 },
    ]);
  });

  it('creates user cells', () => {
    expect(makeBoard(['.', '.'])).toStrictEqual([
      { type: 'user', value: [] },
      { type: 'user', value: [] },
    ]);
  });

  it('handles a mix', () => {
    expect(makeBoard([1, 2, '.', 3, '.'])).toStrictEqual([
      { type: 'puzzle', value: 1 },
      { type: 'puzzle', value: 2 },
      { type: 'user', value: [] },
      { type: 'puzzle', value: 3 },
      { type: 'user', value: [] },
    ]);
  });
});

describe('resetBoard', () => {
  it('resets set user cells', () => {
    expect(resetBoard([
      { type: 'user', value: 3 },
      { type: 'user', value: 5 },
      { type: 'user', value: 7 },
    ])).toStrictEqual([
      { type: 'user', value: [] },
      { type: 'user', value: [] },
      { type: 'user', value: [] },
    ]);
  });

  it('resets marked user cells', () => {
    expect(resetBoard([
      { type: 'user', value: [1, 2, 3] },
      { type: 'user', value: [4, 5, 6] },
      { type: 'user', value: [7, 8, 9] },
    ])).toStrictEqual([
      { type: 'user', value: [] },
      { type: 'user', value: [] },
      { type: 'user', value: [] },
    ]);
  });

  it('ignores puzzle cells', () => {
    expect(resetBoard([
      { type: 'puzzle', value: 3 },
      { type: 'puzzle', value: 4 },
      { type: 'puzzle', value: 5 },
    ])).toStrictEqual([
      { type: 'puzzle', value: 3 },
      { type: 'puzzle', value: 4 },
      { type: 'puzzle', value: 5 },
    ]);
  });

  it('handles a mix', () => {
    expect(resetBoard([
      { type: 'user', value: 3 },
      { type: 'user', value: [1, 2, 3] },
      { type: 'puzzle', value: 9 },
    ])).toStrictEqual([
      { type: 'user', value: [] },
      { type: 'user', value: [] },
      { type: 'puzzle', value: 9 },
    ]);
  });
});

describe('allCellsHaveMark', () => {
  it('handles a single cell', () => {
    expect(allCellsHaveMark(4, [
      { type: 'user', value: [4] },
    ])).toBe(true);
  });

  it('handles multiple cells', () => {
    expect(allCellsHaveMark(4, [
      { type: 'user', value: [1, 2, 3, 4] },
      { type: 'user', value: [3, 4, 5, 6] },
      { type: 'user', value: [4, 5, 6, 7] },
    ])).toBe(true);
  });

  it('is false if a single cell is missing mark', () => {
    expect(allCellsHaveMark(4, [
      { type: 'user', value: [1, 2, 3, 4] },
      { type: 'user', value: [3, 5, 6] },
      { type: 'user', value: [4, 5, 6, 7] },
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
      makeCell('puzzle', 1),
      makeCell('puzzle', 2),
      makeCell('puzzle', 3),
      makeCell('user', [5, 6]),
      makeCell('user', [2, 3]),
      makeCell('puzzle', 6),
      makeCell('puzzle', 7),
      makeCell('user', [4, 5, 6]),
      makeCell('puzzle', 9),
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
      makeCell('puzzle', 1),
      makeCell('puzzle', 2),
      makeCell('puzzle', 3),
      makeCell('user', [4, 5, 6]),
      makeCell('user', [2, 3]),
      makeCell('puzzle', 6),
      makeCell('puzzle', 7),
      makeCell('user', [4, 5, 6]),
      makeCell('puzzle', 9),
    ]);
  });

  it('ignores duplicates', () => {
    expect(boardWithMarkSet(4, [7], board)).toStrictEqual(board);
  });

  it('marks multiple cells', () => {
    expect(boardWithMarkSet(4, [3, 4, 7], board)).toStrictEqual([
      makeCell('puzzle', 1),
      makeCell('puzzle', 2),
      makeCell('puzzle', 3),
      makeCell('user', [4, 5, 6]),
      makeCell('user', [2, 3, 4]),
      makeCell('puzzle', 6),
      makeCell('puzzle', 7),
      makeCell('user', [4, 5, 6]),
      makeCell('puzzle', 9),
    ]);
  });

  it('handles an entire board', () => {
    expect(boardWithMarkSet(4, [0, 1, 2, 3, 4, 5, 6, 7, 8], board)).toStrictEqual([
      makeCell('puzzle', 1),
      makeCell('puzzle', 2),
      makeCell('puzzle', 3),
      makeCell('user', [4, 5, 6]),
      makeCell('user', [2, 3, 4]),
      makeCell('puzzle', 6),
      makeCell('puzzle', 7),
      makeCell('user', [4, 5, 6]),
      makeCell('puzzle', 9),
    ]);
  });
});

describe('boardWithMarkCleared', () => {
  let board;
  
  beforeEach(() => {
    board = [
      makeCell('puzzle', 1),
      makeCell('puzzle', 2),
      makeCell('puzzle', 3),
      makeCell('user', [5, 6]),
      makeCell('user', [2, 3]),
      makeCell('puzzle', 6),
      makeCell('puzzle', 7),
      makeCell('user', [4, 5, 6]),
      makeCell('puzzle', 9),
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
      makeCell('puzzle', 1),
      makeCell('puzzle', 2),
      makeCell('puzzle', 3),
      makeCell('user', [6]),
      makeCell('user', [2, 3]),
      makeCell('puzzle', 6),
      makeCell('puzzle', 7),
      makeCell('user', [4, 5, 6]),
      makeCell('puzzle', 9),
    ]);
  });

  it('ignores cells without a matching mark', () => {
    expect(boardWithMarkCleared(5, [4], board)).toStrictEqual(board);
  });

  it('clears multiple cells', () => {
    expect(boardWithMarkCleared(5, [3, 4, 7], board)).toStrictEqual([
      makeCell('puzzle', 1),
      makeCell('puzzle', 2),
      makeCell('puzzle', 3),
      makeCell('user', [6]),
      makeCell('user', [2, 3]),
      makeCell('puzzle', 6),
      makeCell('puzzle', 7),
      makeCell('user', [4, 6]),
      makeCell('puzzle', 9),
    ]);
  });

  it('handles an entire board', () => {
    expect(boardWithMarkCleared(5, [0, 1, 2, 3, 4, 5, 6, 7, 8], board)).toStrictEqual([
      makeCell('puzzle', 1),
      makeCell('puzzle', 2),
      makeCell('puzzle', 3),
      makeCell('user', [6]),
      makeCell('user', [2, 3]),
      makeCell('puzzle', 6),
      makeCell('puzzle', 7),
      makeCell('user', [4, 6]),
      makeCell('puzzle', 9),
    ]);
  });
});
