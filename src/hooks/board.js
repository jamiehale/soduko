import { useEffect } from 'react';
import * as R from 'ramda';
import useLocalStorage from './local-storage';
import { isUserCell, isSetUserCell, boardCellMarks, isPuzzleCell, cellHasMark, boardCellValue } from '../util/cell';
import useLoggingReducer from './logging-reducer';
import { columnFromCount, rowFromCount, sectionFromCount } from '../logic';

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

const shouldClear = (cellIndex, i) => rowFromCount(cellIndex) === rowFromCount(i)
  || columnFromCount(cellIndex) === columnFromCount(i)
  || sectionFromCount(cellIndex) === sectionFromCount(i);

const boardWithClearedMarks = (value, cellIndex, board) => R.addIndex(R.map)(
  (cell, i) => ((shouldClear(cellIndex, i) && !isPuzzleCell(cell) && !isSetUserCell(cell)) ? cellWithoutMark(value, cell) : cell),
  board,
);

const resetBoard = R.map(R.when(R.propEq('type', 'user'), R.always(boardCell('user', []))));

const reducer = (state, action) => {
  switch (action.type) {
    case 'newGame': {
      const { board } = action.payload;
      return {
        board: initializedBoard(board),
        history: [],
        future: [],
      };
    }
    case 'reset': {
      return {
        board: resetBoard(state.board),
        history: [],
        future: [],
      };
    }
    case 'toggleMark': {
      const { cells, mark } = action.payload;
      return {
        board: boardWithToggledMark(mark, cells, state.board),
        history: R.prepend(
          state.board,
          state.history,
        ),
        future: [],
      };
    }
    case 'set': {
      const { cellIndex, value } = action.payload;
      if (isPuzzleCell(state.board[cellIndex])) {
        return state;
      }
      return {
        board: boardWithClearedMarks(value, cellIndex, boardWithSetValue(value, cellIndex, state.board)),
        history: R.prepend(
          state.board,
          state.history,
        ),
        future: [],
      };
    }
    case 'undo': {
      if (R.isEmpty(state.history)) {
        return state;
      }
      return {
        board: R.head(state.history),
        history: R.tail(state.history),
        future: R.prepend(
          state.board,
          state.future,
        ),
      };
    }
    case 'redo': {
      if (R.isEmpty(state.future)) {
        return state;
      }
      return {
        board: R.head(state.future),
        history: R.prepend(
          state.board,
          state.history,
        ),
        future: R.tail(state.future),
      };
    }
    default: {
      return state;
    }
  }
};

const useBoard = () => {
  const [storedState, setStoredState] = useLocalStorage('soduko', null);

  const [state, dispatch] = useLoggingReducer(
    reducer,
    storedState || {
      board: initializedBoard(R.repeat('.', 81)),
      history: [],
      future: [],
      index: -1,
    },
    'useBoard',
    true,
  );

  useEffect(() => {
    setStoredState(state);
  }, [setStoredState, state]);

  const canUndo = !R.isEmpty(state.history);
  const canRedo = !R.isEmpty(state.future);

  return {
    dispatch,
    board: state.board,
    canUndo,
    canRedo,
  };
};

export const newGame = (dispatch, board) => {
  dispatch({ type: 'newGame', payload: { board } });
};

export const reset = (dispatch, board) => {
  dispatch({ type: 'reset', payload: { board } });
};

export const toggleCellMark = (dispatch, cells, mark) => {
  dispatch({ type: 'toggleMark', payload: { cells, mark } });
};

export const setCellValue = (dispatch, cellIndex, value) => {
  dispatch({ type: 'set', payload: { cellIndex, value } });
};

export const undo = (dispatch) => {
  dispatch({ type: 'undo' });
};

export const redo = (dispatch) => {
  dispatch({ type: 'redo' });
};

export default useBoard;
