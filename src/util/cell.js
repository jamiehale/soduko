import * as R from 'ramda';

export const makeCell = R.curry((type, value) => ({ type, value }));

export const isGivenCell = R.propEq('given', 'type');

export const isPlayerCell = R.complement(isGivenCell);

export const isPlayerCellWithValue = R.both(isPlayerCell, R.propIs(Number, 'value'));

export const isPlayerCellWithMarks = cell => (isPlayerCell(cell) && !isPlayerCellWithValue(cell));

export const isCellWithValue = R.either(isGivenCell, isPlayerCellWithValue);

export const getCellValue = R.prop('value');

export const getCellMarksOr = R.curry((defaultValue, cell) => isCellWithValue(cell) ? defaultValue : R.prop('value', cell));

export const getCellMarks = getCellMarksOr(undefined);

export const cellValueEquals = R.curry((value, cell) => R.propEq(value, 'value', cell));

export const cellHasMark = R.curry((mark, cell) => R.includes(mark, getCellMarksOr([], cell)));

export const getCellStrikes = R.propOr([], 'strikes');

export const cellHasStrike = R.curry((mark, cell) => R.includes(mark, getCellStrikes(cell)));

const withoutStrikes = R.dissoc('strikes');

const withStrikes = R.curry((strikes, cell) => (R.isEmpty(strikes) ? withoutStrikes(cell) : R.assoc('strikes', strikes, cell)));

const sortedUnique = R.compose(R.sort(R.comparator(R.lt)), R.uniq);

export const setPlayerValue = R.curry((value, cell) => R.assoc('value', value, withoutStrikes(cell)));

export const clearPlayerValue = R.compose(R.assoc('value', []), withoutStrikes);

export const clearStrike = R.curry((mark, cell) => withStrikes(R.without([mark], getCellStrikes(cell)), cell));

export const setMark = R.curry((mark, cell) => clearStrike(mark, R.assoc('value', sortedUnique(R.append(mark, getCellMarks(cell))), cell)));

export const clearMark = R.curry((mark, cell) => R.assoc('value', R.without([mark], getCellMarks(cell)), cell));

export const setStrike = R.curry((mark, cell) => withStrikes(sortedUnique(R.append(mark, getCellStrikes(cell))), clearMark(mark, cell)));

// Typing `value` on this cell sets a value (rather than clearing it or doing nothing)
export const isValueSet = R.curry((value, cell) => isPlayerCell(cell) && !cellValueEquals(value, cell));
