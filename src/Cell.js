import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  border: 1px solid red;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Cell = ({
  className,
  cell
}) => {
  const value = cell.value === '.' ? '' : cell.value;

  return (
    <Container className={className}>
      {value}
    </Container>
  );
};

export default Cell;
