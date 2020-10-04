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

const isBoardCell = R.compose(
  R.not,
  R.propEq('boardValue', '.'),
);

const isUserCell = R.propEq('boardValue', '.');

const addMarkToCell = R.curry((mark, cell) => R.uniq(R.append(mark, cell.marks)));

const addMark = (mark, cellIndicesToUpdate, allCells) => R.addIndex(R.map)(
  (cell, i) => (R.includes(i, cellIndicesToUpdate) ? { ...cell, marks: R.ifElse(isUserCell, addMarkToCell(mark), R.prop('marks'))(cell) } : cell),
  allCells,
);

const clearMark = (mark, cellIndicesToUpdate, allCells) => R.addIndex(R.map)(
  (cell, i) => (R.includes(i, cellIndicesToUpdate) ? { ...cell, marks: R.without([mark], cell.marks) } : cell),
  allCells,
);

const allCellsHaveMark = (mark, cellIndicesToCheck, allCells) => R.addIndex(R.reduce)(
  (acc, cell, i) => (acc && (R.includes(i, cellIndicesToCheck) ? (isBoardCell(cell) || R.includes(mark, cell.marks)) : false)),
  true,
  allCells,
);

const toggleMark = (mark, cellIndicesToToggle, allCells) => {
  if (allCellsHaveMark(mark, cellIndicesToToggle, allCells)) {
    console.log('clearing mark');
    return clearMark(mark, cellIndicesToToggle, allCells);
  }
  console.log('setting mark');
  return addMark(mark, cellIndicesToToggle, allCells);
};

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
      if (!R.isEmpty(state.draggedCells)) {
        return {
          ...state,
          board: toggleMark(key, state.draggedCells, state.board),
        };
      }
      if (R.length(state.selectedCells) === 1) {
        return {
          ...state,
          board: R.addIndex(R.map)(
            (cell, i) => (R.includes(i, state.selectedCells) ? { ...cell, userValue: key } : cell),
            state.board,
          ),
        };
      }
      if (R.length(state.selectedCells) > 1) {
        return {
          ...state,
          board: toggleMark(key, state.selectedCells, state.board),
        };
      }
      return state;
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

const initialState = (board = []) => ({
  selectedCells: [],
  draggedCells: [],
  dragging: false,
  board,
});

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState(extractBoard(board)));

  console.log(state);

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
    } else if (event.key === 'Escape') {
      dispatch({ type: 'clearSelection' });
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
