import { Box, Card } from '@material-ui/core';
import React from 'react';
import { UIThemeProvider } from '../../ui-theme-provider';
import { UITextField } from './ui-text-field';

export default {
    title: 'UI components/Textfield'
};

export const Default = () => {

    return <UIThemeProvider>
        <Box p={2}>

            <Card>

                <Box display='inline-block' m={2}>
                    <UITextField label='with label' />
                </Box>

                <Box display='inline-block' m={2}>
                    <UITextField value='without label' />
                </Box>

                <br />

                <Box display='inline-block' m={2}>
                    <UITextField label='with label' disabled />
                </Box>

                <Box display='inline-block' m={2}>
                    <UITextField value='without label' disabled />
                </Box>

            </Card>

        </Box>
    </UIThemeProvider>;
};
