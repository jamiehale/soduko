import { createTheme } from '@mui/material/styles';

// Restores Material-UI v4's defaults that later MUI versions changed, so the
// app looks the same as it did on v4.
const muiTheme = createTheme({
  palette: {
    primary: { main: '#3f51b5' },
    secondary: { main: '#f50057' },
  },
  components: {
    MuiButton: {
      defaultProps: { color: 'inherit' },
    },
    MuiTextField: {
      defaultProps: { variant: 'standard' },
    },
    MuiTabs: {
      defaultProps: { indicatorColor: 'secondary', textColor: 'inherit' },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          maxWidth: 264,
          minWidth: 72,
          padding: '6px 12px',
          lineHeight: 1.75,
          [theme.breakpoints.up('sm')]: {
            minWidth: 160,
            padding: '6px 24px',
          },
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '8px 24px',
          '&:first-of-type': { paddingTop: 20 },
          '.MuiDialogTitle-root + &': { paddingTop: 8 },
        },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: { marginBottom: 12 },
      },
    },
  },
});

export default muiTheme;
