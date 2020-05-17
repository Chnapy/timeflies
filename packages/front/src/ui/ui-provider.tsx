import { CssBaseline } from '@material-ui/core';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import { appTheme } from './app-theme';

const useStyles = makeStyles(() => ({
    '@global': {
        html: {
            fontSize: '62.5%'
        },
        body: {
            overflow: 'hidden'
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
