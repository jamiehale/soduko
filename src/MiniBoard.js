import React from 'react';
import styled from 'styled-components';
import * as R from 'ramda';
import { decode } from './util/decoder';
import useBorder from './hooks/border';

const Cell = styled(({ borderLeft, borderRight, borderTop, borderBottom, ...props }) => <div {...props} />)`
  border-left: ${({ borderLeft }) => (borderLeft ? '1px solid black' : '1px solid lightgrey')};
  border-right: ${({ borderRight }) => (borderRight ? '1px solid black' : '1px solid lightgrey')};
  border-top: ${({ borderTop }) => (borderTop ? '1px solid black' : '1px solid lightgrey')};
  border-bottom: ${({ borderBottom }) => (borderBottom ? '1px solid black' : '1px solid lightgrey')};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 20px);
  grid-template-rows: repeat(9, 20px);
`;


const MiniPuzzle = ({
  puzzle,
}) => {
  const { borderPropsFor } = useBorder();

  return (
    <Container>
      {R.addIndex(R.map)(
        (value, i) => (
          <Cell
            key={i}
            {...borderPropsFor(i)}
          >
            {value === '.' ? '' : value}
          </Cell>
        ),
        decode(puzzle),
      )}
    </Container>
  );
};

export default MiniPuzzle;
