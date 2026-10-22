import { migrateSavedGame } from '../saved-game';

const oldBoard = [
  { type: 'puzzle', value: 5 },
  { type: 'user', value: 3 },
  { type: 'user', value: [1, 2] },
];

const newBoard = [
  { type: 'given', value: 5 },
  { type: 'player', value: 3 },
  { type: 'player', value: [1, 2] },
];

describe('migrateSavedGame', () => {
  it('renames old cell types in the board, history, and future', () => {
    expect(migrateSavedGame({ board: oldBoard, history: [oldBoard, oldBoard], future: [oldBoard] })).toStrictEqual({
      board: newBoard,
      history: [newBoard, newBoard],
      future: [newBoard],
    });
  });

  it('leaves a save in the current format unchanged', () => {
    const save = { board: newBoard, history: [newBoard], future: [] };
    expect(migrateSavedGame(save)).toStrictEqual(save);
  });

  it('is idempotent', () => {
    const save = { board: oldBoard, history: [oldBoard], future: [] };
    expect(migrateSavedGame(migrateSavedGame(save))).toStrictEqual(migrateSavedGame(save));
  });

  it('converts a save that mixes old and new types', () => {
    const mixed = [{ type: 'given', value: 5 }, { type: 'user', value: 3 }, { type: 'player', value: [1, 2] }];
    expect(migrateSavedGame({ board: mixed, history: [], future: [] }).board).toStrictEqual(newBoard);
  });

  it('keeps other fields', () => {
    expect(migrateSavedGame({ board: oldBoard, history: [], future: [], index: -1 })).toStrictEqual({
      board: newBoard,
      history: [],
      future: [],
      index: -1,
    });
  });
});
