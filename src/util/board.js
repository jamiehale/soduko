import * as R from 'ramda';
import {
  makeCell,
  cellHasMark,
  isUserCellWithMarks,
  setMark,
  clearMark,
  isPuzzleCell,
  isUserCellWithValue,
} from './cell';

export const rowFromCount = count => Math.floor(count / 9);

export const columnFromCount = count => count % 9;

export const sectionFromCount = count => Math.floor(rowFromCount(count) / 3) * 3 + Math.floor(columnFromCount(count) / 3);

export const makeBoard = R.map(R.ifElse(R.equals('.'), R.always(makeCell('user', [])), makeCell('puzzle')));

export const resetBoard = R.map(R.when(R.propEq('type', 'user'), R.always(makeCell('user', []))));

export const allCellsHaveMark = (mark, cells) => R.all(cellHasMark(mark), cells);

const isCandidateCell = (cellIndices, cell, index) => R.includes(index, cellIndices) && isUserCellWithMarks(cell);

export const boardWithMarkSet = (mark, cellIndicesToUpdate, board) => R.addIndex(R.map)(
  (cell, i) => (isCandidateCell(cellIndicesToUpdate, cell, i) ? setMark(mark, cell) : cell),
  board,
);

export const boardWithMarkCleared = (mark, cellIndicesToUpdate, board) => R.addIndex(R.map)(
  (cell, i) => (isCandidateCell(cellIndicesToUpdate, cell, i) ? clearMark(mark, cell) : cell),
  board,
);

const shouldClear = (cellIndex, i) => rowFromCount(cellIndex) === rowFromCount(i)
  || columnFromCount(cellIndex) === columnFromCount(i)
  || sectionFromCount(cellIndex) === sectionFromCount(i);

export const boardWithClearedMarks = (value, cellIndex, board) => R.addIndex(R.map)(
  (cell, i) => ((shouldClear(cellIndex, i) && !isPuzzleCell(cell) && !isUserCellWithValue(cell)) ? clearMark(value, cell) : cell),
  board,
);

