import * as R from 'ramda';
import { isCellWithValue, getCellValue } from '../util/cell';
import { columnFromCount, rowFromCount, sectionFromCount } from '../util/board';

const collect = R.addIndex(R.reduce)(
  (acc, cell, i) => {
    if (!isCellWithValue(cell)) {
      return acc;
    }
    return R.assoc(
      getCellValue(cell),
      R.append(
        {
          row: rowFromCount(i),
          column: columnFromCount(i),
          section: sectionFromCount(i),
        },
        R.propOr([], getCellValue(cell), acc),
      ),
      acc,
    );
  },
  {},
);

const collectValues = R.compose(
  R.fromPairs,
  R.map(
    ([name, value]) => ([
      name,
      {
        byRow: R.groupBy(R.prop('row'), value),
        byColumn: R.groupBy(R.prop('column'), value),
        bySection: R.groupBy(R.prop('section'), value),
      },
    ]),
  ),
  R.toPairs,
  collect,
);

const collectConflictingCells = R.compose(
  R.map((d) => d.row * 9 + d.column),
  R.flatten,
  R.filter((a) => R.length(a) > 1),
  R.values,
);

const collectErrorCells = R.compose(
  R.uniq,
  R.reduce(
    (acc, { byRow, byColumn, bySection }) => ([
      ...acc,
      ...collectConflictingCells(byRow),
      ...collectConflictingCells(byColumn),
      ...collectConflictingCells(bySection),
    ]),
    [],
  ),
  R.values,
);

const hasAll = (values, byValue) => R.equals(R.sort(R.comparator(R.lt), R.map((n) => parseInt(n, 10), R.keys(byValue))), values);
const hasAllValues = (byValue) => hasAll(R.range(1, 10), byValue);

const allPartsComplete = R.compose(
  R.reduce(R.and, true),
  R.map(({ byRow, byColumn, bySection }) => hasAll(R.range(0, 9), byRow) && hasAll(R.range(0, 9), byColumn) && hasAll(R.range(0, 9), bySection)),
  R.values,
);

const useGame = (board) => {
  const values = collectValues(board);

  const isSolved = hasAllValues(values) && allPartsComplete(values);
  
  const errorCells = collectErrorCells(values);

  return {
    isSolved,
    errorCells,
  };
};

export default useGame;
