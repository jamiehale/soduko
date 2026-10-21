import * as R from 'ramda';
import { selectionReducer, selectedCellsOf, initialSelectionState } from '../selection';

const apply = (state, ...actions) => R.reduce(selectionReducer, state, actions);

const mouseDown = (cell) => ({ type: 'mouseDown', payload: { cell } });
const mouseUp = (cell) => ({ type: 'mouseUp', payload: { cell } });
const mouseOver = (cell) => ({ type: 'mouseOver', payload: { cell } });
const click = (cell) => [mouseDown(cell), mouseUp(cell)];
const clearSelection = { type: 'clearSelection' };

describe('click', () => {
  it('selects a single cell', () => {
    const state = apply(initialSelectionState, ...click(4));
    expect(selectedCellsOf(state)).toStrictEqual([4]);
    expect(state.isMouseDown).toBe(false);
  });

  it('replaces a previous selection', () => {
    const state = apply(initialSelectionState, mouseDown(0), mouseOver(1), mouseUp(2), ...click(10));
    expect(selectedCellsOf(state)).toStrictEqual([10]);
  });

  it('deselects when the only selected cell is clicked again', () => {
    const state = apply(initialSelectionState, ...click(4), ...click(4));
    expect(selectedCellsOf(state)).toStrictEqual([]);
  });

  it('selects a cell that was part of a multi-cell selection', () => {
    const state = apply(initialSelectionState, mouseDown(0), mouseUp(1), ...click(0));
    expect(selectedCellsOf(state)).toStrictEqual([0]);
  });
});

describe('drag', () => {
  it('selects every cell passed over, start and end included', () => {
    const state = apply(initialSelectionState, mouseDown(0), mouseOver(1), mouseUp(2));
    expect(selectedCellsOf(state)).toStrictEqual([0, 1, 2]);
  });

  it('does not repeat cells passed over twice', () => {
    const state = apply(initialSelectionState, mouseDown(0), mouseOver(1), mouseOver(0), mouseOver(1), mouseUp(1));
    expect(selectedCellsOf(state)).toStrictEqual([0, 1]);
  });

  it('reports dragged cells as selected before the mouse is released', () => {
    const state = apply(initialSelectionState, ...click(40), mouseDown(0), mouseOver(1));
    expect(selectedCellsOf(state)).toStrictEqual([0, 1]);
    expect(state.isMouseDown).toBe(true);
  });
});

describe('mouseOver without a drag', () => {
  it('leaves the selection unchanged', () => {
    const state = apply(initialSelectionState, ...click(4));
    expect(selectionReducer(state, mouseOver(5))).toBe(state);
  });
});

describe('clearSelection', () => {
  it('clears the selection', () => {
    const state = apply(initialSelectionState, mouseDown(0), mouseUp(1), clearSelection);
    expect(selectedCellsOf(state)).toStrictEqual([]);
  });
});
