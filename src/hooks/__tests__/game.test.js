import * as R from 'ramda';
import useGame from '../game';
import { makeBoard } from '../../util/board';
import { makeCell } from '../../util/cell';

// A valid completed grid: row r is the digits 1-9 shifted by 3r + floor(r / 3)
const solution = R.map(
  (i) => ((Math.floor(i / 9) * 3 + Math.floor(Math.floor(i / 9) / 3) + (i % 9)) % 9) + 1,
  R.range(0, 81),
);

const emptyBoard = makeBoard(R.repeat('.', 81));

const withGiven = (index, value) => R.update(index, makeCell('given', value));
const withValue = (index, value) => R.update(index, makeCell('player', value));
const withMarks = (index, marks) => R.update(index, makeCell('player', marks));

const sorted = R.sort(R.comparator(R.lt));

describe('errorCells', () => {
  it('is empty for an empty board', () => {
    expect(useGame(emptyBoard).errorCells).toStrictEqual([]);
  });

  it('flags duplicates in a row', () => {
    const board = R.compose(withGiven(0, 3), withValue(8, 3))(emptyBoard);
    expect(sorted(useGame(board).errorCells)).toStrictEqual([0, 8]);
  });

  it('flags duplicates in a column', () => {
    const board = R.compose(withValue(4, 7), withValue(76, 7))(emptyBoard);
    expect(sorted(useGame(board).errorCells)).toStrictEqual([4, 76]);
  });

  it('flags duplicates in a box on different rows and columns', () => {
    const board = R.compose(withGiven(0, 9), withValue(20, 9))(emptyBoard);
    expect(sorted(useGame(board).errorCells)).toStrictEqual([0, 20]);
  });

  it('ignores equal values with no shared row, column, or box', () => {
    const board = R.compose(withValue(0, 5), withValue(40, 5))(emptyBoard);
    expect(useGame(board).errorCells).toStrictEqual([]);
  });

  it('ignores pencil marks', () => {
    const board = R.compose(withValue(0, 4), withMarks(1, [4]))(emptyBoard);
    expect(useGame(board).errorCells).toStrictEqual([]);
  });
});

describe('isSolved', () => {
  const solvedBoard = makeBoard(solution);

  it('is true for a complete valid board', () => {
    expect(useGame(solvedBoard).isSolved).toBe(true);
  });

  it('is true when the final values were set by the player', () => {
    const board = withValue(40, solution[40])(solvedBoard);
    expect(useGame(board).isSolved).toBe(true);
  });

  it('is false with one empty cell', () => {
    const board = withMarks(40, [])(solvedBoard);
    expect(useGame(board).isSolved).toBe(false);
  });

  it('is false with one wrong value', () => {
    const board = withValue(40, (solution[40] % 9) + 1)(solvedBoard);
    expect(useGame(board).isSolved).toBe(false);
    expect(useGame(board).errorCells).not.toStrictEqual([]);
  });

  it('is false for an empty board', () => {
    expect(useGame(emptyBoard).isSolved).toBe(false);
  });
});
