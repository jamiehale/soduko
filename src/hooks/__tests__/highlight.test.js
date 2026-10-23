import * as R from 'ramda';
import useHighlight from '../highlight';
import { makeBoard } from '../../util/board';
import { makeCell } from '../../util/cell';

const board = R.compose(
  R.update(0, makeCell('given', 7)),
  R.update(1, makeCell('player', 3)),
  R.update(2, makeCell('player', [7])),
)(makeBoard(R.repeat('.', 81)));

const withValues = values => R.reduce(
  (b, [i, cell]) => R.update(Number(i), cell, b),
  makeBoard(R.repeat('.', 81)),
  R.toPairs(values),
);

describe('useHighlight', () => {
  it('highlights nothing without a selection', () => {
    expect(useHighlight([], board)).toStrictEqual({});
  });

  it('highlights a typed digit with no selection like a selected cell holding it', () => {
    // 0 holds the given 7
    expect(useHighlight([], board, 7)).toStrictEqual(useHighlight([0], board));
    expect(useHighlight([], board, 7).highlightValue).toBe(7);
  });

  it('projects every cell holding the typed digit', () => {
    const b = withValues({ 0: makeCell('given', 7), 40: makeCell('player', 7) });
    expect(useHighlight([], b, 7)).toStrictEqual({
      highlightRows: [0, 4],
      highlightColumns: [0, 4],
      highlightBoxes: [0, 4],
      highlightValue: 7,
    });
  });

  it('highlights a typed digit no cell holds with no areas', () => {
    expect(useHighlight([], board, 5)).toStrictEqual({
      highlightRows: [],
      highlightColumns: [],
      highlightBoxes: [],
      highlightValue: 5,
    });
  });

  it('ignores the typed digit when cells are selected', () => {
    expect(useHighlight([40], board, 7)).toStrictEqual(useHighlight([40], board));
  });

  it("highlights a single cell's row, column, and box", () => {
    expect(useHighlight([40], board)).toStrictEqual({
      highlightRows: [4],
      highlightColumns: [4],
      highlightBoxes: [4],
      highlightValue: undefined,
    });
  });

  it('highlights the value of a single selected given value', () => {
    expect(useHighlight([0], board).highlightValue).toBe(7);
  });

  it('highlights the value of a single selected player value', () => {
    expect(useHighlight([1], board).highlightValue).toBe(3);
  });

  it('highlights no value for a cell with marks', () => {
    expect(useHighlight([2], board)).toStrictEqual({
      highlightRows: [0],
      highlightColumns: [2],
      highlightBoxes: [0],
      highlightValue: undefined,
    });
  });

  it('highlights only the shared row for cells across boxes', () => {
    expect(useHighlight([0, 4, 8], board)).toStrictEqual({
      highlightRows: [0],
      highlightColumns: [],
      highlightBoxes: [],
      highlightValue: undefined,
    });
  });

  it('highlights only the shared column for cells across boxes', () => {
    expect(useHighlight([4, 40, 76], board)).toStrictEqual({
      highlightRows: [],
      highlightColumns: [4],
      highlightBoxes: [],
      highlightValue: undefined,
    });
  });

  it('highlights only the shared box for cells on different rows and columns', () => {
    expect(useHighlight([0, 10, 20], board)).toStrictEqual({
      highlightRows: [],
      highlightColumns: [],
      highlightBoxes: [0],
      highlightValue: undefined,
    });
  });

  it('highlights row and box when cells share both', () => {
    expect(useHighlight([0, 1], board)).toStrictEqual({
      highlightRows: [0],
      highlightColumns: [],
      highlightBoxes: [0],
      highlightValue: undefined,
    });
  });

  it('does not project values from a multi-cell selection', () => {
    const twos = withValues({ 0: makeCell('player', 2), 40: makeCell('player', 2) });
    expect(useHighlight([0, 40], twos)).toStrictEqual({
      highlightRows: [],
      highlightColumns: [],
      highlightBoxes: [],
      highlightValue: undefined,
    });
  });

  describe('projecting a selected value', () => {
    it('includes the row, column, and box of every cell holding it', () => {
      // 0 is row 0, column 0, box 0; 40 is row 4, column 4, box 4
      const twos = withValues({ 0: makeCell('player', 2), 40: makeCell('player', 2) });
      expect(useHighlight([0], twos)).toStrictEqual({
        highlightRows: [0, 4],
        highlightColumns: [0, 4],
        highlightBoxes: [0, 4],
        highlightValue: 2,
      });
    });

    it('lists each row, column, and box once', () => {
      // Conflicting placements: 0 and 4 share row 0; 0 and 9 share column 0 and box 0
      const fives = withValues({ 0: makeCell('player', 5), 4: makeCell('player', 5), 9: makeCell('player', 5) });
      expect(useHighlight([4], fives)).toStrictEqual({
        highlightRows: [0, 1],
        highlightColumns: [0, 4],
        highlightBoxes: [0, 1],
        highlightValue: 5,
      });
    });

    it('counts given and player values alike', () => {
      const sevens = withValues({ 0: makeCell('given', 7), 80: makeCell('player', 7) });
      expect(useHighlight([80], sevens)).toStrictEqual({
        highlightRows: [0, 8],
        highlightColumns: [0, 8],
        highlightBoxes: [0, 8],
        highlightValue: 7,
      });
    });

    it('ignores pencil marks of the value', () => {
      const marked = withValues({ 0: makeCell('player', 7), 80: makeCell('player', [7]) });
      expect(useHighlight([0], marked)).toStrictEqual({
        highlightRows: [0],
        highlightColumns: [0],
        highlightBoxes: [0],
        highlightValue: 7,
      });
    });
  });
});
