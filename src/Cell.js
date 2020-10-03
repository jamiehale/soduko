import React from 'react';
import styled from 'styled-components';

const Container = styled(({ selected, ...props }) => <div {...props} />)`
  border: 1px solid red;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ selected }) => (selected ? 'yellow' : 'white')};
  cursor: pointer;
`;

const Cell = ({
  className,
  cell,
  selected,
  onClick,
}) => {
  const value = cell.value === '.' ? '' : cell.value;

  return (
    <Container
      className={className}
      selected={selected}
      onClick={onClick}
    >
      {value}
    </Container>
  );
};

export default Cell;
