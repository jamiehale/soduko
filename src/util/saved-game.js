import * as R from 'ramda';

// Cell types used by saves from before v0.4.0
const renamedTypes = {
  puzzle: 'given',
  user: 'player',
};

const migrateCell = R.over(R.lensProp('type'), type => R.propOr(type, type, renamedTypes));

const migrateBoard = R.map(migrateCell);

// Converts a saved game to the current format; already-current saves are unchanged
export const migrateSavedGame = R.evolve({
  board: migrateBoard,
  history: R.map(migrateBoard),
  future: R.map(migrateBoard),
});
