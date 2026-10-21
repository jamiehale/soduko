import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  line-height: 0.8;
`;

const Subtitle = styled(Typography).attrs({
  variant: 'subtitle2',
})`
  font-style: italic;
`;

const Header = () => (
  <>
    <Title variant="h1">soduko</Title>
    <Subtitle variant="subtitle2" align="right">(suh-doo-ko)</Subtitle>
  </>
);

export default Header;
