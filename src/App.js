import React, { useReducer, useState } from 'react';
import * as R from 'ramda';
import Container from '@material-ui/core/Container';
import useEventListener from '@use-it/event-listener';
import Board from './Board';

const board = `
9...5...2
......38.
..291..6.
..1......
4.3.2.7.5
......8..
.1..952..
.48......
7...6...4
`;

const parseValue = s => parseInt(s, 10);

const extractBoard = R.compose(
  R.map(value => ({
    boardValue: value,
    userValue: '',
    marks: [],
  })),
  R.map(R.when(R.complement(R.equals('.')), parseValue)),
  R.split(''),
  R.replace(/\n/g, ''),
);

const reducer = (state, action) => {
  switch (action.type) {
    case 'mouseDown': {
      const { cell } = action.payload;
      return {
        ...state,
        selectedCells: [],
        draggedCells: [cell],
        dragging: true,
      };
    }
    case 'mouseUp': {
      const { cell } = action.payload;
      return {
        ...state,
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
      }
      if (R.isEmpty(state.draggedCells)) {
        return state;
      }
      if (R.length(state.draggedCells) === 1) {
        return...
      }
      return state;
    }
    default: {
      return state;
    }
  }
};

const initialState = (board = []) => ({
  selectedCells: [],
  draggedCells: [],
  dragging: false,
  board,
});

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState(extractBoard(board)));

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
        game={state.board}
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
