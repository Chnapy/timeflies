import React from 'react';
import { UIThemeProvider } from '@timeflies/app-ui';
import '@timeflies/app-ui/lib/fonts-import.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: 'fullscreen',
};

export const decorators = [
  (Story) => <UIThemeProvider><Story /></UIThemeProvider>
];
