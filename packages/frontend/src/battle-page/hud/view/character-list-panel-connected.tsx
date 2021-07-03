import { Grid, makeStyles } from '@material-ui/core';
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

const useStyles = makeStyles(() => ({
    gridContainer: {
        height: '100%'
    },
    gridItemCharacterList: {
        display: 'flex',
        alignItems: 'flex-end',
        height: '100%'
    },
    gridItemClickable: {
        pointerEvents: 'all'
    }
}));

export const CharacterListPanelConnected: React.FC = () => {
    const classes = useStyles();

    return (
        <DetailsContextProvider>
            <Grid className={classes.gridContainer} container alignItems='flex-end' spacing={1}>
                <Grid className={classes.gridItemCharacterList} item>
                    <InnerCharacterListPanel />
                </Grid>

                <Grid className={classes.gridItemClickable} item>
                    <CharacterDetailsPanel />
                </Grid>

                <Grid className={classes.gridItemClickable} item>
                    <SpellDetailsPanel />
                </Grid>
            </Grid>
        </DetailsContextProvider>
    );
};
