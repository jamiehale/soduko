import ReactDOM from 'react-dom';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import App from './App';
import muiTheme from './mui-theme';

ReactDOM.render(
  // injectFirst puts MUI's styles before styled-components' so the
  // styled-components overrides of MUI components keep winning
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={muiTheme}>
      <App />
    </ThemeProvider>
  </StyledEngineProvider>,
  document.getElementById('root')
);
