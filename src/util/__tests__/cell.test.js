import { isPuzzleCell, isUserCell, isCellWithValue, isUserCellWithValue, cellValueEquals, cellHasMark, getCellMarksOr } from '../cell';

describe('isPuzzleCell', () => {
  it('identifies puzzle cells', () => {
    expect(isPuzzleCell({ type: 'puzzle' })).toBe(true);
  });

  it('identifies non-puzzle cells', () => {
    expect(isPuzzleCell({ type: 'anything else' })).toBe(false);
  });
});

describe('isUserCell', () => {
  it('identifies user cells', () => {
    expect(isUserCell({ type: 'anything else' })).toBe(true);
  });
});

describe('isUserCellWithValue', () => {
  it('is true for user cells with number values', () => {
    expect(isUserCellWithValue({ type: 'user', value: 3 })).toBe(true);
  });

  it('is false for user cells with marks', () => {
    expect(isUserCellWithValue({ type: 'user', value: [] })).toBe(false);
  });

  it('is false for puzzle cells', () => {
    expect(isUserCellWithValue({ type: 'puzzle' })).toBe(false);
  });
});

describe('isCellWithValue', () => {
  it('is true for puzzle cells', () => {
    expect(isCellWithValue({ type: 'puzzle', value: 'anything' })).toBe(true);
  });

  it('is true for user cells with number values', () => {
    expect(isCellWithValue({ type: 'user', value: 3 })).toBe(true);
  });

  it('is false for user cells without number values', () => {
    expect(isCellWithValue({ type: 'user', value: [] })).toBe(false);
  });
});

describe('cellValueEquals', () => {
  it('is true when the value is equal', () => {
    expect(cellValueEquals(4, { value: 4 })).toBe(true);
  });

  it('is false otherwise', () => {
    expect(cellValueEquals(4, { value: 'something else' })).toBe(false);
  });
});

describe('cellHasMark', () => {
  it('is true when the cell has the mark', () => {
    expect(cellHasMark(4, { type: 'user', value: [1, 2, 3, 4] })).toBe(true);
  });

  it('is false when the cell does not have the mark', () => {
    expect(cellHasMark(4, { type: 'user', value: [1, 2, 3, 5] })).toBe(false);
  });

  it('is false for puzzle cells', () => {
    expect(cellHasMark(4, { type: 'puzzle' })).toBe(false);
  });
});

describe('getCellMarksOr', () => {
  it('gets cell marks for unassigned user cell', () => {
    expect(getCellMarksOr('doesnt matter', { type: 'user', value: [1, 2, 3] })).toStrictEqual([1, 2, 3]);
  });

  it('returns the default for assigned user cell', () => {
    expect(getCellMarksOr(99, { type: 'user', value: 3 })).toBe(99);
  });

  it('returns the default for puzzle cell', () => {
    expect(getCellMarksOr(99, { type: 'puzzle' })).toBe(99);
  });
});
