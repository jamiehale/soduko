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
      if (R.length(state.previouslySelectedCells) === 1 && R.equals(state.previouslySelectedCells, draggedCells)) {
        return {
          selectedCells: [],
          draggedCells: [],
          isMouseDown: false,
        };
      }
      return {
        selectedCells: draggedCells,
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

export const initialSelectionState = { selectedCells: [], draggedCells: [] };

export const selectedCellsOf = (state) => (R.isEmpty(state.selectedCells) ? state.draggedCells : state.selectedCells);

const useSelection = () => {
  const [state, dispatch] = useReducer(selectionReducer, initialSelectionState);

  return {
    dispatch,
    selectedCells: selectedCellsOf(state),
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
