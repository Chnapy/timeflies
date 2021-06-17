import { Box } from '@material-ui/core';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import { useHotkeysCode } from './use-hotkeys';
import { useIsMobile } from './use-is-mobile';

export default {
    title: 'hooks',
} as Meta;

export const Default: React.FC = () => {
    const isMobile = useIsMobile();
    useHotkeysCode('KeyQ', () => console.log('KeyQ'));
    useHotkeysCode('KeyW', () => console.log('KeyW'));
    useHotkeysCode('KeyE', () => console.log('KeyE'));
    useHotkeysCode('KeyR', () => console.log('KeyR'));

    return (
        <Box p={2}>
            is mobile: {isMobile ? 'true' : 'false'}
        </Box>
    );
};
