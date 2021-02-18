import React from 'react';
import { SpellButtonPanel } from '@timeflies/spell-button-panel';
import { useSpellButtonPanelProps } from '../hooks/use-spell-button-panel-props';

export const SpellButtonPanelConnected: React.FC = () => {
    const props = useSpellButtonPanelProps();

    return props && (
        <SpellButtonPanel {...props}/>
    );
};
