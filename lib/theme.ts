import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#4caf50', light: '#80e27e', dark: '#087f23' },
    secondary: { main: '#81c784' },
    background: { default: '#f2f6f2', paper: '#ffffff' },
    text: { primary: '#1e2d1e', secondary: '#5a6e5a' },
    warning: { main: '#ff9800' },
    success: { main: '#43a047' },
    error: { main: '#e53935' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    overline: { fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.7rem' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8, fontWeight: 600 },
        sizeLarge: { padding: '10px 24px' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { borderBottom: '1px solid #e8f0e8' },
      },
    },
  },
})

export default theme
