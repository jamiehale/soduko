import { useEffect, useReducer } from 'react';
import * as R from 'ramda';
import useLocalStorage from './local-storage';
import { isPuzzleCell } from '../util/cell';
import {
  makeBoard,
  resetBoard,
  boardWithToggledMark,
  boardWithSetValue,
} from '../util/board';

const reducer = (state, action) => {
  switch (action.type) {
    case 'newGame': {
      const { board } = action.payload;
      return {
        board: makeBoard(board),
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
        board: boardWithSetValue(value, cellIndex, state.board),
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

  const [state, dispatch] = useReducer(
    reducer,
    storedState || {
      board: makeBoard(R.repeat('.', 81)),
      history: [],
      future: [],
      index: -1,
    },
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
