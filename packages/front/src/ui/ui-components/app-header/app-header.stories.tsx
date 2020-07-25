import { UIThemeProvider } from '../../ui-theme-provider';
import React from 'react';
import { Box } from '@material-ui/core';
import { AppHeader } from './app-header';

export default {
    title: 'UI components/App header'
};

export const Default = () => {

    return <UIThemeProvider>
        <Box p={2}>

            <AppHeader username='chnapy'/>

        </Box>
    </UIThemeProvider>;
};
