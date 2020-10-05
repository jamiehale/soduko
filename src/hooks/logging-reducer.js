import { useReducer, useCallback } from 'react';

const useLoggingReducer = (reducer, initialState, label = 'loggingReducer', log = true) => {
  const loggingReducer = useCallback((state, action) => {
    if (log) {
      console.group(label);
      console.log('BEFORE', state);
      console.log('ACTION', action);
      const newState = reducer(state, action);
      console.log('AFTER', newState);
      console.groupEnd();
      return newState;
    }
    return reducer(state, action);
  }, [reducer, label, log]);
    
  const [state, dispatch] = useReducer(loggingReducer, initialState);

  return [
    state,
    dispatch,
  ];
};

export default useLoggingReducer;
