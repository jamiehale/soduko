import * as R from 'ramda';
import { columnFromCount, rowFromCount } from '../util/logic';

const useBorder = () => {
  const borderPropsFor = i => ({
    borderLeft: R.includes(columnFromCount(i), [0, 3, 6]),
    borderRight: columnFromCount(i) === 8,
    borderTop: R.includes(rowFromCount(i), [0, 3, 6]),
    borderBottom: rowFromCount(i) === 8,
  });

  return {
    borderPropsFor,
  };
};

export default useBorder;
