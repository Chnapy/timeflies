import { Box, Grid, makeStyles, Paper } from '@material-ui/core';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { CharacterItem, CharacterItemProps } from './character-item';

export type CharacterListPanelProps = {
    characterMap: {
        [ characterId in CharacterId ]: CharacterItemProps;
    };
    characterList: CharacterId[];
    onMouseEnter: (characterId: CharacterId) => void;
    onMouseLeave: () => void;
    onClick: (characterId: CharacterId) => void;
};

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        maxHeight: '100%',
        backdropFilter: 'blur(2px)',
        pointerEvents: 'all'
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        opacity: 0.5,
        zIndex: -1
    },
    content: {
        padding: spacing(2),
        overflowY: 'auto',
        overflowX: 'hidden'
    }
}));

export const CharacterListPanel: React.FC<CharacterListPanelProps> = ({
    characterMap, characterList, onMouseEnter, onMouseLeave, onClick
}) => {
    const classes = useStyles();

    return (
        <Box className={classes.root} position='relative' display='inline-flex' zIndex={0}>
            <Paper className={classes.background} />

            <div className={classes.content}>
                <Grid container direction='column' wrap='nowrap' spacing={1}>
                    {characterList.map(characterId => (
                        <Grid key={characterId} item>
                            <CharacterItem
                                {...characterMap[ characterId ]}
                                onMouseEnter={() => onMouseEnter(characterId)}
                                onMouseLeave={onMouseLeave}
                                onClick={() => onClick(characterId)}
                            />
                        </Grid>
                    ))}
                </Grid>
            </div>
        </Box>
    );
};
