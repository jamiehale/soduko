import React from 'react';
import styled from 'styled-components';

const Container = styled(({ selected, ...props }) => <div {...props} />)`
  border: 1px solid red;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ selected }) => (selected ? 'yellow' : 'white')};
  cursor: pointer;
  user-select: none;
`;

const Cell = ({
  className,
  cell,
  selected,
  onMouseDown,
  onMouseUp,
  onMouseOver,
}) => {
  const value = cell.value === '.' ? '' : cell.value;

  return (
    <Container
      className={className}
      selected={selected}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
    >
      {value}
    </Container>
  );
};

export default Cell;
