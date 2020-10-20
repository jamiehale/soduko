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

const sameRow = (i, j) => R.eqBy(rowFromCount, i, j);

const sameColumn = (i, j) => R.eqBy(columnFromCount, i, j);

const sameSection = (i, j) => R.eqBy(sectionFromCount, i, j);

export const makeBoard = R.map(R.ifElse(R.equals('.'), R.always(makeCell('user', [])), makeCell('puzzle')));

export const resetBoard = R.map(R.when(R.propEq('type', 'user'), R.always(makeCell('user', []))));

export const allCellsHaveMark = (mark, cells) => R.all(cellHasMark(mark), cells);

const isCandidateCell = (cellIndices, cell, index) => R.includes(index, cellIndices) && isUserCellWithMarks(cell);

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
  || sameSection(cellIndex, i);

export const boardWithRelatedMarksCleared = (mark, sourceCellIndex, board) => R.addIndex(R.map)(
  (cell, i) => ((shouldClear(sourceCellIndex, i) && isUserCellWithMarks(cell)) ? clearMark(mark, cell) : cell),
  board,
);

export const onlyMarkableCells = (cellIndices, board) => R.compose(
  R.filter(isUserCellWithMarks),
  R.addIndex(R.filter)(
    (_, i) => R.includes(i, cellIndices),
  ),
)(board);
