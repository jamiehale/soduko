import {
  isGivenCell,
  isPlayerCell,
  isCellWithValue,
  isPlayerCellWithValue,
  cellValueEquals,
  cellHasMark,
  getCellMarksOr,
  isPlayerCellWithMarks,
  setPlayerValue,
  clearPlayerValue,
  setMark,
  clearMark,
  isValueSet,
} from '../cell';

describe('setPlayerValue', () => {
  it('sets the value', () => {
    expect(setPlayerValue(4, { type: 'player', value: 'anything' })).toStrictEqual({ type: 'player', value: 4 });
  });
});

describe('clearPlayerValue', () => {
  it('replaces the player value with empty marks', () => {
    expect(clearPlayerValue({ type: 'player', value: 'anything' })).toStrictEqual({ type: 'player', value: [] });
  });
});

describe('isGivenCell', () => {
  it('identifies puzzle cells', () => {
    expect(isGivenCell({ type: 'given' })).toBe(true);
  });

  it('identifies non-puzzle cells', () => {
    expect(isGivenCell({ type: 'anything else' })).toBe(false);
  });
});

describe('isPlayerCell', () => {
  it('identifies player cells', () => {
    expect(isPlayerCell({ type: 'anything else' })).toBe(true);
  });
});

describe('isPlayerCellWithValue', () => {
  it('is true for player cells with number values', () => {
    expect(isPlayerCellWithValue({ type: 'player', value: 3 })).toBe(true);
  });

  it('is false for player cells with marks', () => {
    expect(isPlayerCellWithValue({ type: 'player', value: [] })).toBe(false);
  });

  it('is false for puzzle cells', () => {
    expect(isPlayerCellWithValue({ type: 'given' })).toBe(false);
  });
});

describe('isPlayerCellWithMarks', () => {
  it('is true for player cells with no value', () => {
    expect(isPlayerCellWithMarks({ type: 'player', value: [] })).toBe(true);
  });

  it('is false for puzzle cells', () => {
    expect(isPlayerCellWithMarks({ type: 'given' })).toBe(false);
  });

  it('is false for player cells with value', () => {
    expect(isPlayerCellWithMarks({ type: 'player', value: 3 })).toBe(false);
  });
});

describe('isCellWithValue', () => {
  it('is true for puzzle cells', () => {
    expect(isCellWithValue({ type: 'given', value: 'anything' })).toBe(true);
  });

  it('is true for player cells with number values', () => {
    expect(isCellWithValue({ type: 'player', value: 3 })).toBe(true);
  });

  it('is false for player cells without number values', () => {
    expect(isCellWithValue({ type: 'player', value: [] })).toBe(false);
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
    expect(cellHasMark(4, { type: 'player', value: [1, 2, 3, 4] })).toBe(true);
  });

  it('is false when the cell does not have the mark', () => {
    expect(cellHasMark(4, { type: 'player', value: [1, 2, 3, 5] })).toBe(false);
  });

  it('is false for puzzle cells', () => {
    expect(cellHasMark(4, { type: 'given' })).toBe(false);
  });
});

describe('getCellMarksOr', () => {
  it('gets cell marks for player cell without a value', () => {
    expect(getCellMarksOr('doesnt matter', { type: 'player', value: [1, 2, 3] })).toStrictEqual([1, 2, 3]);
  });

  it('returns the default for player cell with a value', () => {
    expect(getCellMarksOr(99, { type: 'player', value: 3 })).toBe(99);
  });

  it('returns the default for puzzle cell', () => {
    expect(getCellMarksOr(99, { type: 'given' })).toBe(99);
  });
});

describe('setMark', () => {
  it('adds the mark', () => {
    expect(setMark(4, { type: 'player', value: [] })).toStrictEqual({ type: 'player', value: [4] });
  });

  it('does not duplicate marks', () => {
    expect(setMark(4, { type: 'player', value: [1, 2, 3, 4] })).toStrictEqual({ type: 'player', value: [1, 2, 3, 4] });
  });

  it('sorts the results', () => {
    expect(setMark(4, { type: 'player', value: [8, 3] })).toStrictEqual({ type: 'player', value: [3, 4, 8] });
  });
});

describe('clearMark', () => {
  it('clears the mark', () => {
    expect(clearMark(4, { type: 'player', value: [1, 2, 3, 4] })).toStrictEqual({ type: 'player', value: [1, 2, 3] });
  });

  it('handles missing marks', () => {
    expect(clearMark(4, { type: 'player', value: [1, 2] })).toStrictEqual({ type: 'player', value: [1, 2] });
  });
});

describe('isValueSet', () => {
  it('is true for an empty player cell', () => {
    expect(isValueSet(5, { type: 'player', value: [1, 5] })).toBe(true);
  });

  it('is true for a player cell holding another value', () => {
    expect(isValueSet(5, { type: 'player', value: 3 })).toBe(true);
  });

  it('is false for a player cell holding the same value', () => {
    expect(isValueSet(5, { type: 'player', value: 5 })).toBe(false);
  });

  it('is false for a given cell', () => {
    expect(isValueSet(5, { type: 'given', value: 3 })).toBe(false);
  });
});
