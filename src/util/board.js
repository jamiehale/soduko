import * as R from 'ramda';

const parseValue = s => parseInt(s, 10);

export const extractBoard = R.compose(
  R.map(R.when(R.complement(R.equals('.')), parseValue)),
  R.map(R.when(R.equals('0'), R.always('.'))),
  R.split(''),
  R.replace(/\n/g, ''),
);
