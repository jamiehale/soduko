import * as R from 'ramda';

export const isPuzzleCell = R.propEq('type', 'puzzle');

export const isUserCell = R.complement(isPuzzleCell);

export const isUserCellWithValue = R.both(isUserCell, R.propIs(Number, 'value'));

export const isCellWithValue = R.either(isPuzzleCell, isUserCellWithValue);

export const getCellValue = R.prop('value');

export const getCellMarksOr = R.curry((defaultValue, cell) => isCellWithValue(cell) ? defaultValue : R.prop('value', cell));

export const getCellMarks = getCellMarksOr(undefined);

export const cellValueEquals = R.propEq('value');

export const cellHasMark = R.curry((mark, cell) => R.includes(mark, getCellMarksOr([], cell)));
