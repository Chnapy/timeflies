import { Box } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { useHotkeys } from './use-hotkeys';
import { useIsMobile } from './use-is-mobile';

export default {
    title: 'hooks',
} as Meta;

export const Default: React.FC = () => {
    const isMobile = useIsMobile();
    useHotkeys('KeyQ', () => console.log('KeyQ'));
    useHotkeys('KeyW', () => console.log('KeyW'));
    useHotkeys('KeyE', () => console.log('KeyE'));
    useHotkeys('KeyR', () => console.log('KeyR'));

    return (
        <Box p={2}>
            is mobile: {isMobile ? 'true' : 'false'}
        </Box>
    );
};
