import { createTheme } from '@mui/material/styles';
import { pink } from '@mui/material/colors';

/**
 * Function that controls the global theme of the app
 * @returns Theme for the application
 */
function AppTheme() {
  return createTheme({
    palette: {
      primary: pink,
      secondary: {
        main: '#880e4f',
      },
    },
  });
}

export default AppTheme;
