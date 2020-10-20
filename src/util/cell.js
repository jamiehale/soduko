import * as R from 'ramda';

export const makeCell = R.curry((type, value) => ({ type, value }));

export const isPuzzleCell = R.propEq('type', 'puzzle');

export const isUserCell = R.complement(isPuzzleCell);

export const isUserCellWithValue = R.both(isUserCell, R.propIs(Number, 'value'));

export const isUserCellWithMarks = cell => (isUserCell(cell) && !isUserCellWithValue(cell));

export const isCellWithValue = R.either(isPuzzleCell, isUserCellWithValue);

export const getCellValue = R.prop('value');

export const getCellMarksOr = R.curry((defaultValue, cell) => isCellWithValue(cell) ? defaultValue : R.prop('value', cell));

export const getCellMarks = getCellMarksOr(undefined);

export const cellValueEquals = R.propEq('value');

export const cellHasMark = R.curry((mark, cell) => R.includes(mark, getCellMarksOr([], cell)));

export const setUserValue = R.assoc('value');

export const clearUserValue = R.assoc('value', []);

export const setMark = R.curry((mark, cell) => R.assoc('value', R.sort(R.comparator(R.lt), R.uniq(R.append(mark, getCellMarks(cell)))), cell));

export const clearMark = R.curry((mark, cell) => R.assoc('value', R.without([mark], getCellMarks(cell)), cell));
