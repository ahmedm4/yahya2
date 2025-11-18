import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { Toaster } from 'react-hot-toast';

import App from './App';
import './styles/index.css';

// Create RTL cache for Material-UI
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create RTL theme
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: [
      'Cairo',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  palette: {
    primary: {
      main: '#8B4513', // Saddle Brown (bread color)
      light: '#A0522D',
      dark: '#654321',
    },
    secondary: {
      main: '#DAA520', // Goldenrod (wheat color)
      light: '#F4A460',
      dark: '#B8860B',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Cairo',
              },
              success: {
                iconTheme: {
                  primary: '#4caf50',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f44336',
                },
              },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);
