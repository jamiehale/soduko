import React, { useReducer, useState } from 'react';
import * as R from 'ramda';
import Container from '@material-ui/core/Container';
import useEventListener from '@use-it/event-listener';
import Board from './Board';

const game = [
  1,2,3,'.','.','.',7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
].map(value => ({ value }));

const reducer = (state, action) => {
  switch (action.type) {
    case 'mouseDown': {
      const { cell } = action.payload;
      return {
        selectedCells: [],
        draggedCells: [cell],
        dragging: true,
      };
    }
    case 'mouseUp': {
      const { cell } = action.payload;
      return {
        selectedCells: R.uniq(R.append(cell, state.draggedCells)),
        draggedCells: [],
        dragging: false,
      };
    }
    case 'mouseOver': {
      const { cell } = action.payload;
      if (state.dragging) {
        return {
          ...state,
          draggedCells: R.uniq(R.append(cell, state.draggedCells)),
        };
      } else {
        return state;
      }
    }
    case 'keyDown': {
      const { key } = action.payload;
      if (state.dragging) {
        return state;
      } else {
        return state;
      }
    }
    default: {
      return state;
    }
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, { selectedCells: [], draggedCells: [], board: game });

  const handleMouseDown = cell => {
    dispatch({ type: 'mouseDown', payload: { cell } });
  };

  const handleMouseUp = cell => {
    dispatch({ type: 'mouseUp', payload: { cell } });
  };

  const handleMouseOver = cell => {
    dispatch({ type: 'mouseOver', payload: { cell } });
  }

  const handleKeyDown = (event) => {
    if (R.includes(event.key, ['1', '2', '3', '4', '5', '6', '7', '8', '9'])) {
      dispatch({ type: 'keyDown', payload: { key: event.key } });
    }
  };

  useEventListener('keydown', handleKeyDown);

  return (
    <Container>
      <Board
        game={game}
        selectedCells={state.selectedCells}
        draggedCells={state.draggedCells}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOver={handleMouseOver}
      />
    </Container>
  );
};

export default App;
