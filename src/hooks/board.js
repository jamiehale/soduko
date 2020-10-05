import * as R from 'ramda';
import useLoggingReducer from './logging-reducer';
import { isUserCell, isSetUserCell, boardCellMarks, isPuzzleCell, cellHasMark, boardCellValue } from '../util/cell';

const boardCell = (type, value) => ({ type, value });

const cellIsMarkable = cell => (isUserCell(cell) && !isSetUserCell(cell));

const cellWithValue = R.curry((value, cell) => R.assoc('value', value, cell));
const cellWithoutValue = R.assoc('value', []);
const cellWithMark = R.curry((mark, cell) => R.assoc('value', R.uniq(R.append(mark, boardCellMarks(cell))), cell));
const cellWithoutMark = R.curry((mark, cell) => R.assoc('value', R.without([mark], boardCellMarks(cell)), cell));

const initializedBoard = R.map(value => boardCell(value === '.' ? 'user' : 'puzzle', value === '.' ? [] : value));

const boardWithMarkAddedToCells = (mark, cellIndicesToUpdate, allCells) => R.addIndex(R.map)(
  (cell, i) => ((R.includes(i, cellIndicesToUpdate) && !isPuzzleCell(cell) && !isSetUserCell(cell)) ? cellWithMark(mark, cell) : cell),
  allCells,
);

const boardWithMarkClearedFromCells = (mark, cellIndicesToUpdate, allCells) => R.addIndex(R.map)(
  (cell, i) => ((R.includes(i, cellIndicesToUpdate) && !isPuzzleCell(cell) && !isSetUserCell(cell)) ? cellWithoutMark(mark, cell) : cell),
  allCells,
);

const allCellsHaveMark = (mark, cells) => R.all(cellHasMark(mark))(cells);

const onlyMarkableCells = (cellIndices, allCells) => R.filter(
  cellIsMarkable,
  R.addIndex(R.filter)(
    (_, i) => R.includes(i, cellIndices),
    allCells,
  ),
);

const boardWithToggledMark = (mark, cellIndicesToToggle, allCells) => {
  if (allCellsHaveMark(mark, onlyMarkableCells(cellIndicesToToggle, allCells))) {
    return boardWithMarkClearedFromCells(mark, cellIndicesToToggle, allCells);
  }
  return boardWithMarkAddedToCells(mark, cellIndicesToToggle, allCells);
};

const boardWithSetValue = (value, cellIndex, board) => {
  if (isPuzzleCell(board[cellIndex])) {
    return board;
  }
  if (boardCellValue(board[cellIndex]) === value) {
    return R.adjust(cellIndex, cellWithoutValue, board);
  }
  return R.adjust(cellIndex, cellWithValue(value), board);
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'reset': {
      const { board } = action.payload;
      return initializedBoard(board);
    }
    case 'toggleMark': {
      const { cells, mark } = action.payload;
      return boardWithToggledMark(mark, cells, state);
    }
    case 'set': {
      const { cell, value } = action.payload;
      return boardWithSetValue(value, cell, state);
    }
    default: {
      return state;
    }
  }
};

const useBoard = (initialBoard) => {
  const [state, dispatch] = useLoggingReducer(reducer, initializedBoard(initialBoard || []));

  return {
    dispatch,
    board: state,
  };
};

export const resetBoard = (dispatch, board) => {
  dispatch({ type: 'reset', payload: { board } });
};

export const toggleCellMark = (dispatch, cells, mark) => {
  dispatch({ type: 'toggleMark', payload: { cells, mark } });
};

export const setCellValue = (dispatch, cell, value) => {
  dispatch({ type: 'set', payload: { cell, value } });
};

export default useBoard;