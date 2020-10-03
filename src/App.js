import React from 'react';
import Container from '@material-ui/core/Container';
import Board from './Board';

const game = [
  1,2,3,'.','.','.',7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
  1,2,3,4,5,6,7,8,9,
].map(value => ({ value }));

const App = () => (
  <Container>
    <Board game={game} />
  </Container>
);

export default App;
