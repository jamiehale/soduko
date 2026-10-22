import * as R from 'ramda';
import { rowFromCount, columnFromCount, sectionFromCount } from '../util/board';
import { getCellValue, isCellWithValue, cellValueEquals } from '../util/cell';

// The row, column, or section every given cell shares, as a zero- or one-element list
const sharedBy = fn => R.compose(
  R.ifElse(R.compose(R.equals(1), R.length), R.identity, R.always([])),
  R.uniq,
  R.map(fn),
);

const allOf = fn => R.compose(R.uniq, R.map(fn));

const singleValue = (selectedCells, board) => {
  if (R.length(selectedCells) !== 1) {
    return undefined;
  }
  const cell = board[R.head(selectedCells)];
  return isCellWithValue(cell) ? getCellValue(cell) : undefined;
};

const cellsHolding = (value, board) => R.compose(
  R.filter(i => cellValueEquals(value, board[i])),
  R.range(0),
  R.length,
)(board);

const useHighlight = (selectedCells, board) => {
  if (R.isEmpty(selectedCells)) {
    return {};
  }

  const highlightValue = singleValue(selectedCells, board);

  // A selected value projects the row, column, and section of every cell holding it
  const projected = R.isNil(highlightValue) ? null : cellsHolding(highlightValue, board);
  const areasOf = fn => (projected ? allOf(fn)(projected) : sharedBy(fn)(selectedCells));

  return {
    highlightRows: areasOf(rowFromCount),
    highlightColumns: areasOf(columnFromCount),
    highlightSections: areasOf(sectionFromCount),
    highlightValue,
  };
};

export default useHighlight;
