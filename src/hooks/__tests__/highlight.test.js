import * as R from 'ramda';
import useHighlight from '../highlight';
import { makeBoard } from '../../util/board';
import { makeCell } from '../../util/cell';

const board = R.compose(
  R.update(0, makeCell('puzzle', 7)),
  R.update(1, makeCell('user', 3)),
  R.update(2, makeCell('user', [7])),
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

  it("highlights a single cell's row, column, and section", () => {
    expect(useHighlight([40], board)).toStrictEqual({
      highlightRows: [4],
      highlightColumns: [4],
      highlightSections: [4],
      highlightValue: undefined,
    });
  });

  it('highlights the value of a single selected clue', () => {
    expect(useHighlight([0], board).highlightValue).toBe(7);
  });

  it('highlights the value of a single selected entered value', () => {
    expect(useHighlight([1], board).highlightValue).toBe(3);
  });

  it('highlights no value for a cell with marks', () => {
    expect(useHighlight([2], board)).toStrictEqual({
      highlightRows: [0],
      highlightColumns: [2],
      highlightSections: [0],
      highlightValue: undefined,
    });
  });

  it('highlights only the shared row for cells across sections', () => {
    expect(useHighlight([0, 4, 8], board)).toStrictEqual({
      highlightRows: [0],
      highlightColumns: [],
      highlightSections: [],
      highlightValue: undefined,
    });
  });

  it('highlights only the shared column for cells across sections', () => {
    expect(useHighlight([4, 40, 76], board)).toStrictEqual({
      highlightRows: [],
      highlightColumns: [4],
      highlightSections: [],
      highlightValue: undefined,
    });
  });

  it('highlights only the shared section for cells on different rows and columns', () => {
    expect(useHighlight([0, 10, 20], board)).toStrictEqual({
      highlightRows: [],
      highlightColumns: [],
      highlightSections: [0],
      highlightValue: undefined,
    });
  });

  it('highlights row and section when cells share both', () => {
    expect(useHighlight([0, 1], board)).toStrictEqual({
      highlightRows: [0],
      highlightColumns: [],
      highlightSections: [0],
      highlightValue: undefined,
    });
  });

  it('does not project values from a multi-cell selection', () => {
    const twos = withValues({ 0: makeCell('user', 2), 40: makeCell('user', 2) });
    expect(useHighlight([0, 40], twos)).toStrictEqual({
      highlightRows: [],
      highlightColumns: [],
      highlightSections: [],
      highlightValue: undefined,
    });
  });

  describe('projecting a selected value', () => {
    it('includes the row, column, and section of every cell holding it', () => {
      // 0 is row 0, column 0, section 0; 40 is row 4, column 4, section 4
      const twos = withValues({ 0: makeCell('user', 2), 40: makeCell('user', 2) });
      expect(useHighlight([0], twos)).toStrictEqual({
        highlightRows: [0, 4],
        highlightColumns: [0, 4],
        highlightSections: [0, 4],
        highlightValue: 2,
      });
    });

    it('lists each row, column, and section once', () => {
      // Conflicting placements: 0 and 4 share row 0; 0 and 9 share column 0 and section 0
      const fives = withValues({ 0: makeCell('user', 5), 4: makeCell('user', 5), 9: makeCell('user', 5) });
      expect(useHighlight([4], fives)).toStrictEqual({
        highlightRows: [0, 1],
        highlightColumns: [0, 4],
        highlightSections: [0, 1],
        highlightValue: 5,
      });
    });

    it('counts clues and entered values alike', () => {
      const sevens = withValues({ 0: makeCell('puzzle', 7), 80: makeCell('user', 7) });
      expect(useHighlight([80], sevens)).toStrictEqual({
        highlightRows: [0, 8],
        highlightColumns: [0, 8],
        highlightSections: [0, 8],
        highlightValue: 7,
      });
    });

    it('ignores pencil marks of the value', () => {
      const marked = withValues({ 0: makeCell('user', 7), 80: makeCell('user', [7]) });
      expect(useHighlight([0], marked)).toStrictEqual({
        highlightRows: [0],
        highlightColumns: [0],
        highlightSections: [0],
        highlightValue: 7,
      });
    });
  });
});
