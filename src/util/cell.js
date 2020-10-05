import * as R from 'ramda';

export const isPuzzleCell = R.propEq('type', 'puzzle');
export const isUserCell = R.complement(isPuzzleCell);
export const isSetUserCell = R.propIs(Number, 'value');
export const cellHasValue = cell => (isPuzzleCell(cell) || isSetUserCell(cell));

export const boardCellValue = R.prop('value');
export const boardCellMarks = cell => (isSetUserCell(cell) ? [] : cell.value);

export const cellValueEquals = R.curry((value, cell) => R.propEq('value', value, cell));

export const cellHasMark = R.curry((mark, cell) => R.includes(mark, boardCellMarks(cell)));
