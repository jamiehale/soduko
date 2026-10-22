import * as R from 'ramda';
import { boardReducer } from '../board';
import { makeBoard } from '../../util/board';
import { decode } from '../../util/decoder';

const puzzle = '.8..4....3......1........2...5...4.69..1..8..2...........3.9....6....5.....2.....';

const initialState = () => ({
  board: makeBoard(decode(puzzle)),
  history: [],
  future: [],
});

const apply = (state, ...actions) => R.reduce(boardReducer, state, actions);

const set = (cellIndex, value) => ({ type: 'set', payload: { cellIndex, value } });
const toggleMark = (cells, mark) => ({ type: 'toggleMark', payload: { cells, mark } });
const setMany = (placements) => ({ type: 'setMany', payload: { placements } });
const fillMarks = { type: 'fillMarks' };
const undo = { type: 'undo' };
const redo = { type: 'redo' };

describe('newGame', () => {
  it('builds a fresh board and clears history', () => {
    const state = apply(initialState(), set(0, 5));
    const next = boardReducer(state, { type: 'newGame', payload: { puzzle: decode(puzzle) } });
    expect(next).toStrictEqual(initialState());
  });
});

describe('set', () => {
  it('sets a value in a player cell', () => {
    const next = apply(initialState(), set(0, 5));
    expect(next.board[0]).toStrictEqual({ type: 'player', value: 5 });
  });

  it('pushes the previous board onto history and clears future', () => {
    const state = initialState();
    const next = boardReducer({ ...state, future: [state.board] }, set(0, 5));
    expect(next.history).toStrictEqual([state.board]);
    expect(next.future).toStrictEqual([]);
  });

  it('replaces an existing value', () => {
    const next = apply(initialState(), set(0, 3), set(0, 7));
    expect(next.board[0]).toStrictEqual({ type: 'player', value: 7 });
  });

  it('clears the cell when the same value is set again', () => {
    const next = apply(initialState(), set(0, 4), set(0, 4));
    expect(next.board[0]).toStrictEqual({ type: 'player', value: [] });
  });

  it('replaces marks with the value', () => {
    const next = apply(initialState(), toggleMark([0], 2), set(0, 5));
    expect(next.board[0]).toStrictEqual({ type: 'player', value: 5 });
  });

  it('ignores given cells without adding history', () => {
    const state = initialState();
    expect(boardReducer(state, set(1, 5))).toBe(state);
  });

  it('clears the mark from cells in the same row, column, and box', () => {
    // 2 shares the row, 10 the box, 27 the column; 80 is unrelated
    const state = apply(initialState(), toggleMark([2, 10, 27, 80], 6), toggleMark([2], 3));
    const next = boardReducer(state, set(0, 6));
    expect(next.board[2]).toStrictEqual({ type: 'player', value: [3] });
    expect(next.board[10]).toStrictEqual({ type: 'player', value: [] });
    expect(next.board[27]).toStrictEqual({ type: 'player', value: [] });
    expect(next.board[80]).toStrictEqual({ type: 'player', value: [6] });
  });
});

describe('toggleMark', () => {
  it('adds the mark to every selected player cell', () => {
    const next = apply(initialState(), toggleMark([0, 2, 3], 2));
    expect(R.map((i) => next.board[i].value, [0, 2, 3])).toStrictEqual([[2], [2], [2]]);
  });

  it('adds the mark to all cells when only some have it', () => {
    const next = apply(initialState(), toggleMark([0, 2], 2), toggleMark([0, 2, 3], 2));
    expect(R.map((i) => next.board[i].value, [0, 2, 3])).toStrictEqual([[2], [2], [2]]);
  });

  it('removes the mark when every selected player cell has it', () => {
    const next = apply(initialState(), toggleMark([0, 2, 3], 2), toggleMark([0, 2, 3], 2));
    expect(R.map((i) => next.board[i].value, [0, 2, 3])).toStrictEqual([[], [], []]);
  });

  it('skips given cells and cells with values', () => {
    const next = apply(initialState(), set(0, 5), toggleMark([0, 1, 2], 2));
    expect(next.board[0]).toStrictEqual({ type: 'player', value: 5 });
    expect(next.board[1]).toStrictEqual({ type: 'given', value: 8 });
    expect(next.board[2]).toStrictEqual({ type: 'player', value: [2] });
  });

  it('keeps marks sorted', () => {
    const next = apply(initialState(), toggleMark([0], 9), toggleMark([0], 1), toggleMark([0], 5));
    expect(next.board[0].value).toStrictEqual([1, 5, 9]);
  });

  it('pushes history and clears future', () => {
    const state = initialState();
    const next = boardReducer({ ...state, future: [state.board] }, toggleMark([0], 1));
    expect(next.history).toStrictEqual([state.board]);
    expect(next.future).toStrictEqual([]);
  });
});

describe('reset', () => {
  it('clears player cells, keeps given cells, and clears history', () => {
    const next = apply(initialState(), set(0, 5), toggleMark([2], 3), undo, { type: 'reset' });
    expect(next).toStrictEqual(initialState());
  });
});

describe('undo', () => {
  it('restores the previous board and moves the current one to future', () => {
    const changed = apply(initialState(), set(0, 5));
    const next = boardReducer(changed, undo);
    expect(next.board).toStrictEqual(initialState().board);
    expect(next.history).toStrictEqual([]);
    expect(next.future).toStrictEqual([changed.board]);
  });

  it('does nothing with empty history', () => {
    const state = initialState();
    expect(boardReducer(state, undo)).toBe(state);
  });
});

describe('redo', () => {
  it('reapplies an undone change', () => {
    const changed = apply(initialState(), set(0, 5));
    const next = apply(changed, undo, redo);
    expect(next).toStrictEqual(changed);
  });

  it('does nothing with empty future', () => {
    const state = initialState();
    expect(boardReducer(state, redo)).toBe(state);
  });

  it('is unavailable after a new change following undo', () => {
    const next = apply(initialState(), set(0, 5), undo, set(0, 6));
    expect(next.future).toStrictEqual([]);
  });
});

describe('unknown action', () => {
  it('returns the same state', () => {
    const state = initialState();
    expect(boardReducer(state, { type: 'nope' })).toBe(state);
  });
});

describe('setMany', () => {
  // 0 and 2 share a row and a box; 40 and 41 share a box
  const marked = () => apply(initialState(), toggleMark([0, 2], 4), toggleMark([2], 9), toggleMark([40, 41], 7));
  const placements = [{ cellIndex: 0, value: 4 }, { cellIndex: 40, value: 7 }];

  it('returns the same state for no placements', () => {
    const state = marked();
    expect(boardReducer(state, setMany([]))).toBe(state);
  });

  it('sets every placement in one history entry and clears future', () => {
    const state = marked();
    const next = boardReducer({ ...state, future: [state.board] }, setMany(placements));
    expect(next.board[0]).toStrictEqual({ type: 'player', value: 4 });
    expect(next.board[40]).toStrictEqual({ type: 'player', value: 7 });
    expect(next.board[2]).toStrictEqual({ type: 'player', value: [9] });
    expect(next.board[41]).toStrictEqual({ type: 'player', value: [] });
    expect(next.history).toStrictEqual([state.board, ...state.history]);
    expect(next.future).toStrictEqual([]);
  });

  it('is undone in one step, restoring every mark', () => {
    const state = marked();
    const next = apply(state, setMany(placements), undo);
    expect(next.board).toStrictEqual(state.board);
  });

  it('is redone in one step', () => {
    const state = marked();
    const set = boardReducer(state, setMany(placements));
    expect(apply(set, undo, redo).board).toStrictEqual(set.board);
  });
});

describe('fillMarks', () => {
  const marked = () => apply(initialState(), toggleMark([0, 2], 4), set(3, 7));

  it('fills every empty player cell in one history entry and clears future', () => {
    const state = marked();
    const next = boardReducer({ ...state, future: [state.board] }, fillMarks);
    // Cell 0 sees givens 8 and 4 in its row, 3, 9, and 2 in its column, and player value 7 in its row
    expect(next.board[0]).toStrictEqual({ type: 'player', value: [1, 5, 6] });
    expect(next.board[1]).toStrictEqual(state.board[1]);
    expect(next.board[3]).toStrictEqual({ type: 'player', value: 7 });
    expect(next.history).toStrictEqual([state.board, ...state.history]);
    expect(next.future).toStrictEqual([]);
  });

  it('is undone in one step, restoring every mark', () => {
    const state = marked();
    expect(apply(state, fillMarks, undo).board).toStrictEqual(state.board);
  });

  it('is redone in one step', () => {
    const filled = boardReducer(marked(), fillMarks);
    expect(apply(filled, undo, redo).board).toStrictEqual(filled.board);
  });

  it('returns the same state when nothing changes', () => {
    const filled = boardReducer(marked(), fillMarks);
    expect(boardReducer(filled, fillMarks)).toBe(filled);
  });
});
