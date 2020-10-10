import * as R from 'ramda';
import useLoggingReducer from './logging-reducer';
import { isUserCell, isSetUserCell, boardCellMarks, isPuzzleCell, cellHasMark, boardCellValue } from '../util/cell';
import { useCallback, useEffect } from 'react';

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
    case 'initialize': {
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
    case 'reset': {
      const { newState } = action.payload;
      return newState;
    }
    default: {
      return state;
    }
  }
};

const undoReducer = (state, action) => {
  switch (action.type) {
    case 'push': {
      const { value } = action.payload;
      return {
        values: R.append(value, state.values),
        index: state.index + 1,
      };
    }
    case 'undo': {
      return {
        ...state,
        index: Math.max(0, state.index - 1),
      };
    }
    case 'redo': {
      return {
        ...state,
        index: Math.min(R.length(state.values) - 1, state.index + 1),
      };
    }
    default: {
      return state;
    }
  }
};

const useUndo = (currentValue, onChange) => {
  const [state, dispatch] = useLoggingReducer(undoReducer, { values: [currentValue], index: 0 });

  const activeValue = state.values[state.index];
  const canUndo = state.index > 0;
  const undoValue = canUndo ? state.values[state.index - 1] : undefined;
  const canRedo = state.index < (R.length(state.values) - 1);
  const redoValue = canRedo ? state.values[state.index + 1] : undefined;

  useEffect(() => {
    if (!R.equals(currentValue, activeValue)) {
      dispatch({ type: 'push', payload: { value: currentValue } });
    }
  }, [dispatch, currentValue, activeValue]);

  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: 'undo' });
      onChange(undoValue);
    }
  }, [dispatch, canUndo, undoValue, onChange]);

  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: 'redo' });
      onChange(redoValue);
    }
  }, [dispatch, canRedo, redoValue, onChange]);

  return {
    canUndo,
    undo,
    canRedo,
    redo,
  };
};

const useBoard = (initialBoard) => {
  const [state, dispatch] = useLoggingReducer(reducer, initializedBoard(initialBoard || []));
  const handleReset = useCallback((value) => {
    dispatch({ type: 'reset', payload: { newState: value } });
  }, [dispatch]);
  const { canUndo, undo, canRedo, redo } = useUndo(state, handleReset);

  return {
    dispatch,
    board: state,
    canUndo,
    undo,
    canRedo,
    redo,
  };
};

export const resetBoard = (dispatch, board) => {
  dispatch({ type: 'initialize', payload: { board } });
};

export const toggleCellMark = (dispatch, cells, mark) => {
  dispatch({ type: 'toggleMark', payload: { cells, mark } });
};

export const setCellValue = (dispatch, cell, value) => {
  dispatch({ type: 'set', payload: { cell, value } });
};

export default useBoard;
