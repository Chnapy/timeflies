import React from 'react';
import { UIThemeProvider } from '../src/theme/ui-theme-provider';
import '../src/theme/fonts-import.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

export const decorators = [
  (Story) => <UIThemeProvider><Story/></UIThemeProvider>
];
