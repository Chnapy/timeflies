import { makeStyles } from '@material-ui/core';
import React from 'react';
import '../src/theme/fonts-import.css';
import { UIThemeProvider } from '../src/theme/ui-theme-provider';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: 'fullscreen',
  options: {
    showPanel: false
  }
};

const useGlobalStyles = makeStyles(() => ({
  '@global': {
    body: {
      maxHeight: '100vh',
      overflow: 'auto'
    }
  }
}));

const GlobalStyleDecorator: React.FC = ({ children }) => {
  useGlobalStyles();

  return <>{children}</>;
};

export const decorators = [
  (Story) => (
    <GlobalStyleDecorator>
      <UIThemeProvider>
        <Story />
      </UIThemeProvider>
    </GlobalStyleDecorator>
  )
];
