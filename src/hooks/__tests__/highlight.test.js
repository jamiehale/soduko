import * as R from 'ramda';
import useHighlight from '../highlight';
import { makeBoard } from '../../util/board';
import { makeCell } from '../../util/cell';

const board = R.compose(
  R.update(0, makeCell('puzzle', 7)),
  R.update(1, makeCell('user', 3)),
  R.update(2, makeCell('user', [7])),
)(makeBoard(R.repeat('.', 81)));

describe('useHighlight', () => {
  it('highlights nothing without a selection', () => {
    expect(useHighlight([], board)).toStrictEqual({});
  });

  it("highlights a single cell's row, column, and section", () => {
    expect(useHighlight([40], board)).toStrictEqual({
      highlightRow: 4,
      highlightColumn: 4,
      highlightSection: 4,
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
    expect(useHighlight([2], board).highlightValue).toBeUndefined();
  });

  it('highlights only the shared row for cells across sections', () => {
    expect(useHighlight([0, 4, 8], board)).toStrictEqual({
      highlightRow: 0,
      highlightColumn: undefined,
      highlightSection: undefined,
      highlightValue: undefined,
    });
  });

  it('highlights only the shared column for cells across sections', () => {
    expect(useHighlight([4, 40, 76], board)).toStrictEqual({
      highlightRow: undefined,
      highlightColumn: 4,
      highlightSection: undefined,
      highlightValue: undefined,
    });
  });

  it('highlights only the shared section for cells on different rows and columns', () => {
    expect(useHighlight([0, 10, 20], board)).toStrictEqual({
      highlightRow: undefined,
      highlightColumn: undefined,
      highlightSection: 0,
      highlightValue: undefined,
    });
  });

  it('highlights row and section when cells share both', () => {
    expect(useHighlight([0, 1], board)).toStrictEqual({
      highlightRow: 0,
      highlightColumn: undefined,
      highlightSection: 0,
      highlightValue: undefined,
    });
  });
});
