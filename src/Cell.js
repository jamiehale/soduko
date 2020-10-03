import React from 'react';
import styled from 'styled-components';

const Container = styled(({ selected, dragged, ...props }) => <div {...props} />)`
  border: 1px solid red;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ selected, dragged }) => (dragged ? 'lightblue' : selected ? 'yellow' : 'white')};
  cursor: pointer;
  user-select: none;
`;

const Cell = ({
  className,
  cell,
  selected,
  dragged,
  onMouseDown,
  onMouseUp,
  onMouseOver,
}) => {
  const value = cell.value === '.' ? '' : cell.value;

  return (
    <Container
      className={className}
      selected={selected}
      dragged={dragged}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOver={onMouseOver}
    >
      {value}
    </Container>
  );
};

export default Cell;
