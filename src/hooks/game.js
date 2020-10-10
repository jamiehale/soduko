import * as R from 'ramda';
import { isValueCell, boardCellValue } from '../util/cell';

const isRowComplete = (row, board) => R.compose(
  R.equals([1, 2, 3, 4, 5, 6, 7, 8, 9]),
  R.sort(R.comparator(R.lt)),
  R.map((cell) => (isValueCell(cell) ? boardCellValue(cell) : undefined)),
  R.map((i) => board[row * 9 + i]),
)(R.range(0, 9));

const isColumnComplete = (column, board) => R.compose(
  R.equals([1, 2, 3, 4, 5, 6, 7, 8, 9]),
  R.sort(R.comparator(R.lt)),
  R.map((cell) => (isValueCell(cell) ? boardCellValue(cell) : undefined)),
  R.map((i) => board[i * 9 + column]),
)(R.range(0, 9));

const allRowsComplete = (board) => R.reduce(
  (acc, i) => acc && isRowComplete(i, board),
  true,
  R.range(0, 9),
);

const allColumnsComplete = (board) => R.reduce(
  (acc, i) => acc && isColumnComplete(i, board),
  true,
  R.range(0, 9),
);

const useGame = (board) => {
  const isComplete = allRowsComplete(board) && allColumnsComplete(board);

  return {
    isComplete,
  };
};

export default useGame;
