import styled from 'styled-components';
import * as R from 'ramda';
import UnstyledTypography from '@mui/material/Typography';

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
    font-size: 0.75rem;
    line-height: 1rem;
  }
`;

const Mark = styled(Typography).attrs({
  align: 'center',
})`
  color: ${({ theme }) => theme.colors.mark.text};
  ${({ $struck, theme }) => $struck && `
    text-decoration: line-through ${theme.colors.strike.line} 2px;
  `}
`;

const markFor = (i, marks, strikes) => {
  if (R.includes(i, marks)) {
    return <Mark key={i}>{i}</Mark>;
  }
  if (R.includes(i, strikes)) {
    return <Mark key={i} $struck>{i}</Mark>;
  }
  return <div key={i} />;
};

const MarkedCell = ({
  marks,
  strikes,
}) => {
  const items = R.map(i => markFor(i, marks, strikes), R.range(1, 10));

  return (
    <Container>
      {items}
    </Container>
  );
};

export default MarkedCell;
