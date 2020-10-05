import { useReducer } from 'react';
import * as R from 'ramda';

const selectionReducer = (state, action) => {
  switch (action.type) {
    case 'mouseDown': {
      const { cell } = action.payload;
      return {
        selectedCells: [],
        draggedCells: [cell],
        isMouseDown: true,
      };
    }
    case 'mouseUp': {
      const { cell } = action.payload;
      return {
        selectedCells: R.uniq(R.append(cell, state.draggedCells)),
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
        ...state,
        selectedCells: [],
      };
    }
    default: {
      return state;
    }
  }
};

const useSelection = () => {
  const [state, dispatch] = useReducer(selectionReducer, { selectedCells: [], draggedCells: [] });

  return {
    dispatch,
    selectedCells: R.isEmpty(state.selectedCells) ? state.draggedCells : state.selectedCells,
    isMouseDown: state.isMouseDown,
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

export default useSelection;
