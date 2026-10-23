import * as R from 'ramda';
import {
  makeCell,
  cellHasMark,
  isPlayerCellWithMarks,
  setMark,
  clearMark,
  isGivenCell,
  isCellWithValue,
  getCellValue,
  clearPlayerValue,
  setPlayerValue,
  getCellStrikes,
  cellHasStrike,
  setStrike,
  clearStrike,
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

const boardWithCandidateCells = (fn, cellIndices, board) => R.addIndex(R.map)(
  (cell, i) => (isCandidateCell(cellIndices, cell, i) ? fn(cell) : cell),
  board,
);

export const boardWithMarkSet = (mark, cellIndices, board) => boardWithCandidateCells(setMark(mark), cellIndices, board);

export const boardWithMarkCleared = (mark, cellIndices, board) => boardWithCandidateCells(clearMark(mark), cellIndices, board);

const shouldClear = (cellIndex, i) => sameRow(cellIndex, i)
  || sameColumn(cellIndex, i)
  || sameBox(cellIndex, i);

const peerValues = (cellIndex, board) => R.addIndex(R.chain)(
  (cell, i) => (i !== cellIndex && shouldClear(cellIndex, i) && isCellWithValue(cell) ? [getCellValue(cell)] : []),
  board,
);

export const possibleMarks = R.curry((cellIndex, board) => R.difference(R.range(1, 10), peerValues(cellIndex, board)));

export const boardWithFilledMarks = board => R.addIndex(R.map)(
  (cell, i) => (isPlayerCellWithMarks(cell) ? R.assoc('value', R.difference(possibleMarks(i, board), getCellStrikes(cell)), cell) : cell),
  board,
);

export const boardWithRelatedMarksCleared = R.curry((mark, sourceCellIndex, board) => R.addIndex(R.map)(
  (cell, i) => ((shouldClear(sourceCellIndex, i) && isPlayerCellWithMarks(cell)) ? clearMark(mark, cell) : cell),
  board,
));

const canTakeMark = R.curry((mark, board, cellIndex) => isPlayerCellWithMarks(board[cellIndex])
  && R.includes(mark, possibleMarks(cellIndex, board)));

// Only cells that can take the mark decide the toggle, but clearing reaches every
// selected cell, so a struck mark a peer has since made redundant can still go
const boardWithToggled = (has, set, clear) => R.curry((mark, cellIndices, board) => {
  const takers = R.filter(canTakeMark(mark, board), cellIndices);
  if (R.all(i => has(mark, board[i]), takers)) {
    return boardWithCandidateCells(clear(mark), cellIndices, board);
  }
  return boardWithCandidateCells(set(mark), takers, board);
});

export const boardWithToggledMark = boardWithToggled(cellHasMark, setMark, clearMark);

export const boardWithToggledStrike = boardWithToggled(cellHasStrike, setStrike, clearStrike);

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

export const boardWithSetValues = R.curry((placements, board) => R.reduce(
  (acc, { cellIndex, value }) => boardWithSetValue(value, cellIndex, acc),
  board,
  placements,
));

const boxIndices = box => R.filter(i => boxFromCount(i) === box, R.range(0, 81));

const anyCellHasValue = (value, indices, board) => R.any(
  i => isCellWithValue(board[i]) && getCellValue(board[i]) === value,
  indices,
);

const boxSingles = R.curry((board, box) => {
  const indices = boxIndices(box);
  return R.chain(
    (value) => {
      if (anyCellHasValue(value, indices, board)) {
        return [];
      }
      const marked = R.filter(i => cellHasMark(value, board[i]), indices);
      return R.length(marked) === 1 ? [{ cellIndex: R.head(marked), value }] : [];
    },
    R.range(1, 10),
  );
});

// Digits are visited in ascending order, so a cell that is single for two
// digits keeps the lower one.
export const findBoxSingles = board => R.compose(
  R.sortBy(R.prop('cellIndex')),
  R.uniqBy(R.prop('cellIndex')),
  R.chain(boxSingles(board)),
)(R.range(0, 9));

export const nextBulkSet = R.curry((board, errorCells) => (R.isEmpty(errorCells) ? findBoxSingles(board) : []));
