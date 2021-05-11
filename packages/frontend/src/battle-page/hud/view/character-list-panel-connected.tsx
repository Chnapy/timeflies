import { Grid } from '@material-ui/core';
import { CharacterListPanel } from '@timeflies/character-list-panel';
import React from 'react';
import { CharacterDetailsPanel } from '../details-panel/character-details-panel';
import { DetailsContextProvider } from '../details-panel/details-context';
import { SpellDetailsPanel } from '../details-panel/spell-details-panel';
import { useCharacterListPanelProps } from '../hooks/use-character-list-panel-props';


export const InnerCharacterListPanel: React.FC = () => {
    const props = useCharacterListPanelProps();

    return (
        <CharacterListPanel {...props} />
    );
};

export const CharacterListPanelConnected: React.FC = () => (
    <DetailsContextProvider>
        <Grid container alignItems='flex-end' spacing={1}>
            <Grid item>
                <InnerCharacterListPanel />
            </Grid>

            <Grid item>
                <CharacterDetailsPanel />
            </Grid>

            <Grid item>
                <SpellDetailsPanel />
            </Grid>
        </Grid>
    </DetailsContextProvider>
);
