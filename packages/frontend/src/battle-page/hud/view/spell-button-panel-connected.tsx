import { Box } from '@material-ui/core';
import { SpellButtonPanel } from '@timeflies/spell-button-panel';
import React from 'react';
import { DetailsContextProvider } from '../details-panel/details-context';
import { SpellDetailsPanel } from '../details-panel/spell-details-panel';
import { useSpellButtonPanelProps } from '../hooks/use-spell-button-panel-props';

const InnerSpellButtonPanelConnected: React.FC = () => {
    const props = useSpellButtonPanelProps();

    return props && (
        <Box style={{ position: 'relative' }}>
            <Box pr={1} style={{ position: 'absolute', left: 0, bottom: 0, transform: 'translateX(-100%)' }}>
                <SpellDetailsPanel />
            </Box>

            <SpellButtonPanel {...props} />
        </Box>
    );
};

export const SpellButtonPanelConnected: React.FC = () => (
    <DetailsContextProvider>
        <InnerSpellButtonPanelConnected />
    </DetailsContextProvider>
);
