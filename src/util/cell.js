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

export const setPlayerValue = R.assoc('value');

export const clearPlayerValue = R.assoc('value', []);

export const setMark = R.curry((mark, cell) => R.assoc('value', R.sort(R.comparator(R.lt), R.uniq(R.append(mark, getCellMarks(cell)))), cell));

export const clearMark = R.curry((mark, cell) => R.assoc('value', R.without([mark], getCellMarks(cell)), cell));

// Typing `value` on this cell sets a value (rather than clearing it or doing nothing)
export const isValueSet = R.curry((value, cell) => isPlayerCell(cell) && !cellValueEquals(value, cell));
