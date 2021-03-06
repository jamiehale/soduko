import * as R from 'ramda';
import { rowFromCount, columnFromCount, sectionFromCount } from '../util/board';
import { getCellValue, isCellWithValue } from '../util/cell';

const useHighlight = (selectedCells, board) => {
  if (R.isEmpty(selectedCells)) {
    return {};
  }

  const selectedRows = R.uniq(R.map(rowFromCount, selectedCells));
  const highlightRow = R.length(selectedRows) === 1 ? R.head(selectedRows) : undefined;

  const selectedColumns = R.uniq(R.map(columnFromCount, selectedCells));
  const highlightColumn = R.length(selectedColumns) === 1 ? R.head(selectedColumns) : undefined;

  const selectedSections = R.uniq(R.map(sectionFromCount, selectedCells));
  const highlightSection = R.length(selectedSections) === 1 ? R.head(selectedSections) : undefined;

  const highlightValue = R.length(selectedCells) === 1 ? (isCellWithValue(board[R.head(selectedCells)]) ? getCellValue(board[R.head(selectedCells)]) : undefined) : undefined;

  return {
    highlightRow,
    highlightColumn,
    highlightSection,
    highlightValue,
  };
};

export default useHighlight;
