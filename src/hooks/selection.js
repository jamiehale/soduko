import { useReducer } from 'react';
import * as R from 'ramda';

export const selectionReducer = (state, action) => {
  switch (action.type) {
    case 'mouseDown': {
      const { cell } = action.payload;
      return {
        selectedCells: [],
        previouslySelectedCells: state.selectedCells,
        draggedCells: [cell],
        isMouseDown: true,
      };
    }
    case 'mouseUp': {
      const { cell } = action.payload;
      const draggedCells = R.uniq(R.append(cell, state.draggedCells));
      const isDeselect = R.length(state.previouslySelectedCells) === 1 && R.equals(state.previouslySelectedCells, draggedCells);
      return {
        ...R.pick(['highlightDigit'], state),
        selectedCells: isDeselect ? [] : draggedCells,
        draggedCells: [],
        isMouseDown: false,
      };
    }
    case 'mouseOver': {
      const { cell } = action.payload;
      if (R.isEmpty(state.draggedCells)) {
        return state;
      }
      return {
        ...state,
        draggedCells: R.uniq(R.append(cell, state.draggedCells)),
      };
    }
    case 'clearSelection': {
      return {
        ...R.dissoc('highlightDigit', state),
        selectedCells: [],
      };
    }
    case 'highlightDigit': {
      const { digit } = action.payload;
      if (state.highlightDigit === digit) {
        return R.dissoc('highlightDigit', state);
      }
      return {
        ...state,
        highlightDigit: digit,
      };
    }
    case 'markDigit': {
      const { digit } = action.payload;
      return {
        ...state,
        highlightDigit: digit,
      };
    }
    case 'clearHighlightDigit': {
      return R.dissoc('highlightDigit', state);
    }
    default: {
      return state;
    }
  }
};

export const initialSelectionState = { selectedCells: [], draggedCells: [] };

export const selectedCellsOf = (state) => (R.isEmpty(state.selectedCells) ? state.draggedCells : state.selectedCells);

const useSelection = () => {
  const [state, dispatch] = useReducer(selectionReducer, initialSelectionState);

  return {
    dispatch,
    selectedCells: selectedCellsOf(state),
    isMouseDown: state.isMouseDown,
    highlightDigit: state.highlightDigit,
  };
};

export const mouseDown = (dispatch, cell) => {
  dispatch({ type: 'mouseDown', payload: { cell } });
};

export const mouseUp = (dispatch, cell) => {
  dispatch({ type: 'mouseUp', payload: { cell } });
};

export const mouseOver = (dispatch, cell) => {
  dispatch({ type: 'mouseOver', payload: { cell } });
};

export const clearSelection = (dispatch) => {
  dispatch({ type: 'clearSelection' });
};

export const highlightDigit = (dispatch, digit) => {
  dispatch({ type: 'highlightDigit', payload: { digit } });
};

export const markDigit = (dispatch, digit) => {
  dispatch({ type: 'markDigit', payload: { digit } });
};

export const clearHighlightDigit = (dispatch) => {
  dispatch({ type: 'clearHighlightDigit' });
};

export default useSelection;
