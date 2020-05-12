import { CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core';
import React from 'react';
import { appTheme } from './app-theme';

const useStyles = makeStyles(() => ({
    '@global': {
        html: {
            fontSize: '62.5%'
        }
    }
}));

export const UIProvider: React.FC = ({ children }) => {

    useStyles();
    
    return (
        <ThemeProvider theme={appTheme}>
            <CssBaseline />

            {children}

        </ThemeProvider>
    );
};
