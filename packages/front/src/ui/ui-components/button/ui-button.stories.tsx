import { UIThemeProvider } from '../../ui-theme-provider';
import React from 'react';
import { Box, Card } from '@material-ui/core';
import { UIButton } from './ui-button';

export default {
    title: 'UI components/Button'
};

export const Default = () => {

    return <UIThemeProvider>
        <Box p={2}>

            <Card>

                <Box display='inline-block' m={2}>
                    <UIButton>
                        default
</UIButton>
                </Box>

                <Box display='inline-block' m={2}>
                    <UIButton variant='secondary'>
                        secondary
</UIButton>
                </Box>

                <Box display='inline-block' m={2}>
                    <UIButton variant='primary'>
                        primary
</UIButton>
                </Box>

                <br />

                <Box display='inline-block' m={2}>
                    <UIButton variant='secondary' disabled>
                        secondary
</UIButton>
                </Box>

                <Box display='inline-block' m={2}>
                    <UIButton variant='primary' disabled>
                        primary
</UIButton>
                </Box>

            </Card>

        </Box>
    </UIThemeProvider>;
};
