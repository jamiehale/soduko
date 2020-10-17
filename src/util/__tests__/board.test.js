import * as R from 'ramda';
import { rowFromCount, columnFromCount, sectionFromCount } from '../board';

describe('rowFromIndex', () => {
  it('maps to rows', () => {
    R.addIndex(R.forEach)(
      (row, i) => {
        expect(rowFromCount(i)).toBe(row);
      },
      R.flatten(
        R.map(
          R.repeat(R.__, 9),
          R.range(0, 9),
        ),
      ),
    );
  });
})

describe('columnFromCount', () => {
  it('maps to columns', () => {
    R.addIndex(R.forEach)(
      (column, i) => {
        expect(columnFromCount(i)).toBe(column);
      },
      R.flatten(
        R.repeat(
          R.range(0, 9),
          9,
        ),
      ),
    );
  });
});

describe('sectionFromCount', () => {
  it('maps to sections', () => {
    R.addIndex(R.forEach)(
      (section, i) => {
        expect(sectionFromCount(i)).toBe(section);
      },
      R.flatten(
        R.map(
          (i) => R.repeat(
            R.flatten(
              R.map(
                R.repeat(R.__, 3),
                R.range(i * 3, i * 3 + 3),
              ),
            ),
            3,
          ),
          R.range(0, 3),
        ),
      ),
    );
  });
});
