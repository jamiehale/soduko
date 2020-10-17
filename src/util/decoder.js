import * as R from 'ramda';

const parseValue = s => parseInt(s, 10);

export const decode = R.compose(
  R.map(R.when(R.complement(R.equals('.')), parseValue)),
  R.split(''),
  R.replace(/0/g, '.'),
  R.replace(/[ \t\n]/g, ''),
);
