import * as R from 'ramda';
import { rowFromCount, columnFromCount, sectionFromCount, boardCellValue } from '../logic';

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

  const highlightValue = R.length(selectedCells) === 1 ? boardCellValue(board, R.head(selectedCells)) : undefined;

  return {
    highlightRow,
    highlightColumn,
    highlightSection,
    highlightValue,
  };
};

export default useHighlight;
