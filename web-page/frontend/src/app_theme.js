import { createTheme } from '@mui/material/styles';
import { pink } from '@mui/material/colors';

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
