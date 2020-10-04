import React from 'react';
import styled from 'styled-components';
import * as R from 'ramda';
import UnstyledTypography from '@material-ui/core/Typography';

const Typography = styled(UnstyledTypography)``;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 1fr 1fr 1fr;

  ${Typography} {
    margin: 0px;
    padding: 0px;
    font-size: 0.65rem;
  }
`;

const MarkedCell = ({
  marks,
}) => {
  const items = R.map(
    i => (R.includes(`${i}`, marks) ? <Typography key={i} color="secondary">{i}</Typography> : <div key={i} />),
    R.range(1, 10),
  );

  return (
    <Container>
      {items}
    </Container>
  );
};

export default MarkedCell;
