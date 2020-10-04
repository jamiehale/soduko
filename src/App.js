import React, { useReducer, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import * as R from 'ramda';
import Container from '@material-ui/core/Container';
import useEventListener from '@use-it/event-listener';
import Board from './Board';
import { boardCellValue, rowFromCount, columnFromCount, sectionFromCount } from './logic';
import theme from './theme';

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

const isSetUserCell = cell => isUserCell(cell) && !R.isEmpty(cell.userValue);

const addMarkToCell = R.curry((mark, cell) => R.uniq(R.append(mark, cell.marks)));

const addMark = (mark, cellIndicesToUpdate, allCells) => R.addIndex(R.map)(
  (cell, i) => ((R.includes(i, cellIndicesToUpdate) && !isBoardCell(cell) && !isSetUserCell(cell)) ? { ...cell, marks: addMarkToCell(mark, cell) } : cell),
  allCells,
);

const clearMark = (mark, cellIndicesToUpdate, allCells) => R.addIndex(R.map)(
  (cell, i) => (R.includes(i, cellIndicesToUpdate) ? { ...cell, marks: R.without([mark], cell.marks) } : cell),
  allCells,
);

const cellHasMark = (mark, cell) => (isBoardCell(cell) || R.includes(mark, cell.marks));

const allCellsHaveMark = (mark, cellIndicesToCheck, allCells) => R.reduce(
  (acc, cellIndex) => (acc && cellHasMark(mark, allCells[cellIndex])),
  true,
  cellIndicesToCheck,
);

const toggleMark = (mark, cellIndicesToToggle, allCells) => {
  if (allCellsHaveMark(mark, cellIndicesToToggle, allCells)) {
    return clearMark(mark, cellIndicesToToggle, allCells);
  }
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
            (cell, i) => ((R.includes(i, state.selectedCells) && isUserCell(cell)) ? { ...cell, userValue: cell.userValue === key ? '' : key } : cell),
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

const useHighlight = (selectedCells, draggedCells, board) => {
  if (R.isEmpty(selectedCells) && R.isEmpty(draggedCells)) {
    return {};
  }

  const consideredCells = R.isEmpty(selectedCells) ? draggedCells : selectedCells;

  const selectedRows = R.uniq(R.map(rowFromCount, consideredCells));
  const highlightRow = R.length(selectedRows) === 1 ? R.head(selectedRows) : undefined;

  const selectedColumns = R.uniq(R.map(columnFromCount, consideredCells));
  const highlightColumn = R.length(selectedColumns) === 1 ? R.head(selectedColumns) : undefined;

  const selectedSections = R.uniq(R.map(sectionFromCount, consideredCells));
  const highlightSection = R.length(selectedSections) === 1 ? R.head(selectedSections) : undefined;

  const highlightValue = R.length(consideredCells) === 1 ? boardCellValue(board, R.head(consideredCells)) : undefined;

  return {
    highlightRow,
    highlightColumn,
    highlightSection,
    highlightValue,
  };
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState(extractBoard(board)));
  const highlight = useHighlight(state.selectedCells, state.draggedCells, state.board);

  console.log(state);
  console.log('DEBUG', R.map(isBoardCell, state.board));

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
      dispatch({ type: 'keyDown', payload: { key: parseInt(event.key, 10) } });
    } else if (event.key === 'Escape') {
      dispatch({ type: 'clearSelection' });
    }
  };

  useEventListener('keydown', handleKeyDown);

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Board
          game={state.board}
          selectedCells={R.isEmpty(state.selectedCells) ? state.draggedCells : state.selectedCells}
          highlight={highlight}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseOver={handleMouseOver}
        />
      </Container>
    </ThemeProvider>
  );
};

export default App;
