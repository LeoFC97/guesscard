import { createTheme } from '@mui/material';

export const palette = {
  bgDeep: '#0e1e25',
  bg1: '#16242c',
  bg2: '#1d2c34',
  bg3: '#24323a',
  border: '#2d3c45',
  borderStrong: '#3a4a54',
  text: '#f0f0f0',
  textDim: '#b8c2c9',
  textMute: '#7f8892',
  accent: '#08c3bd',
  accentStrong: '#06a7ac',
  good: '#16793d',
  partial: '#c9710c',
  bad: '#ad1d1d',
};

export const guesscardTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: palette.bgDeep, paper: palette.bg1 },
    primary: { main: palette.accent, contrastText: '#062227' },
    secondary: { main: palette.accentStrong, contrastText: '#fff' },
    success: { main: palette.good, contrastText: '#fff' },
    warning: { main: palette.partial, contrastText: '#fff' },
    error: { main: palette.bad, contrastText: '#fff' },
    text: { primary: palette.text, secondary: palette.textDim },
    divider: palette.border,
  },
  typography: {
    fontFamily: '"Source Sans 3", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontWeight: 200, letterSpacing: '0.5px' },
    h2: { fontWeight: 200, letterSpacing: '0.5px' },
    h3: { fontWeight: 300 },
    h4: { fontWeight: 400 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0.4 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: palette.bg1,
          border: `1px solid ${palette.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 700 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});
