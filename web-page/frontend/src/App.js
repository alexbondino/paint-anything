import React from 'react';
import CleanTempDir from './components/page_status/page_status.js';
import { ThemeProvider } from '@mui/material/styles';
import AppTheme from './app_theme.js';
import { Editor } from './Editor.js';

const App = () => {
  return (
    <ThemeProvider theme={AppTheme()}>
      <div>
        <Editor />
        <CleanTempDir />
      </div>
    </ThemeProvider>
  );
};

export default App;
