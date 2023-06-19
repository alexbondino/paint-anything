import React from 'react';
import CleanTempDir from './components/page_status/page_status.js';
import { ThemeProvider } from '@mui/material/styles';
import AppTheme from './app_theme.js';
import {SidebarVisibility} from './SidebarVisibility.js'
import ImageEditor from './components/image-editor/image_editor.js'

const App = () => {
  return (
    <ThemeProvider theme={AppTheme()}>
      <div>
        <SidebarVisibility />
        <CleanTempDir />
      </div>
    </ThemeProvider>
  );
};

export default App;


