import React, { useReducer, useState } from 'react';
import * as R from 'ramda';
import Container from '@material-ui/core/Container';
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
        selectedCells: [cell],
        dragging: true,
      };
    }
    case 'mouseUp': {
      const { cell } = action.payload;
      return {
        selectedCells: R.uniq(R.append(cell, state.selectedCells)),
        dragging: false,
      };
    }
    case 'mouseOver': {
      const { cell } = action.payload;
      if (state.dragging) {
        return {
          ...state,
          selectedCells: R.uniq(R.append(cell, state.selectedCells)),
        };
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
  const [state, dispatch] = useReducer(reducer, { selectedCells: [] });

  const handleMouseDown = cell => {
    dispatch({ type: 'mouseDown', payload: { cell } });
  };

  const handleMouseUp = cell => {
    dispatch({ type: 'mouseUp', payload: { cell } });
  };

  const handleMouseOver = cell => {
    dispatch({ type: 'mouseOver', payload: { cell } });
  }

  return (
    <Container>
      <Board
        game={game}
        selectedCells={state.selectedCells}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOver={handleMouseOver}
      />
    </Container>
  );
};

export default App;
