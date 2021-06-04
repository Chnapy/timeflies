import { UIThemeProvider } from '@timeflies/app-ui';
import '@timeflies/app-ui/lib/fonts-import.css';
import { SCALE_MODES, settings } from 'pixi.js';
import React from 'react';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

export const decorators = [
  (Story) => <UIThemeProvider><Story /></UIThemeProvider>
];
