import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { appTheme } from './app-theme';

export const UIThemeProvider: React.FC = ({ children }) => {

    return (
        <ThemeProvider theme={appTheme}>
            <CssBaseline />

            {children}

        </ThemeProvider>
    );
};
