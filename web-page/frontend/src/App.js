import React from 'react';
import CleanTempDir from './components/page_status/page_status.js';
import { ThemeProvider } from '@mui/material/styles';
import AppTheme from './app_theme.js';
import {ImageEditor} from './ImageEditor.js'

const App = () => {
  return (
    <ThemeProvider theme={AppTheme()}>
      <div>
        <ImageEditor />
        <CleanTempDir />
      </div>
    </ThemeProvider>
  );
};

export default App;


