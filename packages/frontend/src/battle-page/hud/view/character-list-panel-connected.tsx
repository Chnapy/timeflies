import React from 'react';
import { CharacterListPanel } from '@timeflies/character-list-panel';
import { useCharacterListPanelProps } from '../hooks/use-character-list-panel-props';

export const CharacterListPanelConnected: React.FC = () => {
    const props = useCharacterListPanelProps();

    return (
        <CharacterListPanel {...props}/>
    );
};
