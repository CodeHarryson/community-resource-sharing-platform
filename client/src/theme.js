import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // University of Houston palette (primary = Coog red)
    primary: {
      main: '#C8102E'
    },
    secondary: {
      main: '#ffb300'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14
        }
      }
    }
  }
});

export default theme;
