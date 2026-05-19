import { createTheme } from '@mui/material/styles';

const baseTypography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  h1: { fontWeight: 800, letterSpacing: '-0.02em' },
  h2: { fontWeight: 800, letterSpacing: '-0.02em' },
  h3: { fontWeight: 800, letterSpacing: '-0.015em' },
  h4: { fontWeight: 700, letterSpacing: '-0.01em' },
  h5: { fontWeight: 700 },
  h6: { fontWeight: 700 },
  button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
};

const baseShape = { borderRadius: 14 };

const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        paddingInline: 18,
        paddingBlock: 10,
        transition: 'transform 0.12s ease, box-shadow 0.12s ease, background 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 20,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1', dark: '#4f46e5', light: '#a5b4fc' },
    secondary: { main: '#ec4899' },
    success: { main: '#10b981' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
  },
  shape: baseShape,
  typography: baseTypography,
  components,
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#818cf8', dark: '#6366f1', light: '#c7d2fe' },
    secondary: { main: '#f472b6' },
    success: { main: '#34d399' },
    error: { main: '#f87171' },
    warning: { main: '#fbbf24' },
    background: { default: '#0f172a', paper: '#1e293b' },
    text: { primary: '#f1f5f9', secondary: '#94a3b8' },
  },
  shape: baseShape,
  typography: baseTypography,
  components,
});

export const gradients = {
  light: 'radial-gradient(at 0% 0%, rgba(165,180,252,0.45) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(244,114,182,0.35) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(96,165,250,0.35) 0px, transparent 50%)',
  dark: 'radial-gradient(at 0% 0%, rgba(99,102,241,0.25) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(236,72,153,0.20) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(56,189,248,0.20) 0px, transparent 50%)',
};
