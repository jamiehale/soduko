import * as R from 'ramda';
import useLoggingReducer from './logging-reducer';
import { cellValue } from '../logic';

const initializeBoard = R.map(value => ({
  boardValue: value,
  userValue: '',
  marks: [],
}));

const isBoardCell = R.compose(
  R.not,
  R.propEq('boardValue', '.'),
);

const isUserCell = R.propEq('boardValue', '.');

const isSetUserCell = cell => isUserCell(cell) && !R.isEmpty(cell.userValue);

const addMarkToCell = R.curry((mark, cell) => R.uniq(R.append(mark, cell.marks)));

const addMark = (mark, cellIndicesToUpdate, allCells) => R.addIndex(R.map)(
  (cell, i) => ((R.includes(i, cellIndicesToUpdate) && !isBoardCell(cell) && !isSetUserCell(cell)) ? { ...cell, marks: addMarkToCell(mark, cell) } : cell),
  allCells,
);

const clearMark = (mark, cellIndicesToUpdate, allCells) => R.addIndex(R.map)(
  (cell, i) => (R.includes(i, cellIndicesToUpdate) ? { ...cell, marks: R.without([mark], cell.marks) } : cell),
  allCells,
);

const cellHasMark = (mark, cell) => (isBoardCell(cell) || R.includes(mark, cell.marks));

const allCellsHaveMark = (mark, cellIndicesToCheck, allCells) => R.reduce(
  (acc, cellIndex) => (acc && cellHasMark(mark, allCells[cellIndex])),
  true,
  cellIndicesToCheck,
);

const toggleMark = (mark, cellIndicesToToggle, allCells) => {
  if (allCellsHaveMark(mark, cellIndicesToToggle, allCells)) {
    return clearMark(mark, cellIndicesToToggle, allCells);
  }
  return addMark(mark, cellIndicesToToggle, allCells);
};

const setValue = (value, cellIndex, allCells) => {
  if (isBoardCell(allCells[cellIndex])) {
    return allCells;
  }
  if (cellValue(allCells[cellIndex]) === value) {
    return R.adjust(cellIndex, R.assoc('userValue', ''), allCells);
  }
  return R.adjust(cellIndex, R.assoc('userValue', value), allCells);
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'reset': {
      const { board } = action.payload;
      return initializeBoard(board);
    }
    case 'toggleMark': {
      const { cells, mark } = action.payload;
      return toggleMark(mark, cells, state);
    }
    case 'set': {
      const { cell, value } = action.payload;
      return setValue(value, cell, state);
    }
    default: {
      return state;
    }
  }
};

const useBoard = (initialBoard) => {
  const [state, dispatch] = useLoggingReducer(reducer, initializeBoard(initialBoard || []));

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
