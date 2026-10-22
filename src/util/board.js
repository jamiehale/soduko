import * as R from 'ramda';
import {
  makeCell,
  cellHasMark,
  isPlayerCellWithMarks,
  setMark,
  clearMark,
  isGivenCell,
  getCellValue,
  clearPlayerValue,
  setPlayerValue,
} from './cell';

export const rowFromCount = count => Math.floor(count / 9);

export const columnFromCount = count => count % 9;

export const boxFromCount = count => Math.floor(rowFromCount(count) / 3) * 3 + Math.floor(columnFromCount(count) / 3);

const sameRow = (i, j) => R.eqBy(rowFromCount, i, j);

const sameColumn = (i, j) => R.eqBy(columnFromCount, i, j);

const sameBox = (i, j) => R.eqBy(boxFromCount, i, j);

export const makeBoard = R.map(R.ifElse(R.equals('.'), R.always(makeCell('player', [])), makeCell('given')));

export const resetBoard = R.map(R.when(R.propEq('player', 'type'), R.always(makeCell('player', []))));

export const allCellsHaveMark = R.curry((mark, cells) => R.all(cellHasMark(mark), cells));

const isCandidateCell = (cellIndices, cell, index) => R.includes(index, cellIndices) && isPlayerCellWithMarks(cell);

export const boardWithMarkSet = (mark, cellIndices, board) => R.addIndex(R.map)(
  (cell, i) => (isCandidateCell(cellIndices, cell, i) ? setMark(mark, cell) : cell),
  board,
);

export const boardWithMarkCleared = (mark, cellIndices, board) => R.addIndex(R.map)(
  (cell, i) => (isCandidateCell(cellIndices, cell, i) ? clearMark(mark, cell) : cell),
  board,
);

const shouldClear = (cellIndex, i) => sameRow(cellIndex, i)
  || sameColumn(cellIndex, i)
  || sameBox(cellIndex, i);

export const boardWithRelatedMarksCleared = R.curry((mark, sourceCellIndex, board) => R.addIndex(R.map)(
  (cell, i) => ((shouldClear(sourceCellIndex, i) && isPlayerCellWithMarks(cell)) ? clearMark(mark, cell) : cell),
  board,
));

const cellSet = R.curry((cellIndices, board) => R.addIndex(R.filter)(
  (_, i) => R.includes(i, cellIndices),
  board,
));

const allMarkableCellsHaveMark = (mark, cellIndices, board) => R.compose(
  R.all(cellHasMark(mark)),
  R.filter(isPlayerCellWithMarks),
  cellSet(cellIndices),
)(board);

export const boardWithToggledMark = R.curry((mark, cellIndices, board) => {
  if (allMarkableCellsHaveMark(mark, cellIndices, board)) {
    return boardWithMarkCleared(mark, cellIndices, board);
  }
  return boardWithMarkSet(mark, cellIndices, board);
});

export const boardWithToggledValue = R.curry((value, cellIndex, board) => {
  if (isGivenCell(board[cellIndex])) {
    return board;
  }
  if (getCellValue(board[cellIndex]) === value) {
    return R.adjust(cellIndex, clearPlayerValue, board);
  }
  return R.adjust(cellIndex, setPlayerValue(value), board);
});

export const boardWithSetValue = (value, cellIndex, board) => R.compose(
  boardWithRelatedMarksCleared(value, cellIndex),
  boardWithToggledValue(value, cellIndex),
)(board);
