import { Box, Grid, makeStyles, Paper } from '@material-ui/core';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { CharacterItem, CharacterItemProps } from './character-item';

export type CharacterListPanelProps = {
    characterMap: {
        [ characterId in CharacterId ]: CharacterItemProps;
    };
    characterList: CharacterId[];
};

const useStyles = makeStyles(() => ({
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        opacity: 0.5,
        zIndex: -1
    }
}));

export const CharacterListPanel: React.FC<CharacterListPanelProps> = ({
    characterMap, characterList
}) => {
    const classes = useStyles();

    return (
        <Box position='relative' display='inline-flex' p={2} zIndex={0}>
            <Paper className={classes.background} />

            <Grid container direction='column' spacing={1}>
                {characterList.map(characterId => (
                    <Grid key={characterId} item>
                        <CharacterItem {...characterMap[ characterId ]} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
