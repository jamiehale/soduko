import { decode } from '../decoder';

describe('decode', () => {
  it('converts to numbers', () => {
    expect(decode('12345')).toStrictEqual([1, 2, 3, 4, 5]);
  });

  it('skips .', () => {
    expect(decode('123.45')).toStrictEqual([1, 2, 3, '.', 4, 5]);
  });

  it('converts 0 to .', () => {
    expect(decode('123045')).toStrictEqual([1, 2, 3, '.', 4, 5]);
  });

  it('skips whitespace', () => {
    expect(decode(`
    123
    456
    789
    `)).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
