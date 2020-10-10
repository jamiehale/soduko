import { useCallback, useEffect } from 'react';
import * as R from 'ramda';
import useLoggingReducer from './logging-reducer';

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
  const [state, dispatch] = useLoggingReducer(undoReducer, { values: [currentValue], index: 0 }, false);

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

export default useUndo;
