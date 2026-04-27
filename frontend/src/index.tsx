import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { inject } from '@vercel/analytics';

import App from './App';
import { LocaleProvider } from './contexts/LocaleContext';
import { guesscardTheme } from './styles/theme';
import './styles/loldle.css';

inject();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <LocaleProvider>
      <ThemeProvider theme={guesscardTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </LocaleProvider>
  </React.StrictMode>
);
