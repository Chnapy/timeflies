import { Grid, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { UIButton, UIText } from '@timeflies/app-ui';
import { ObjectTyped, PlayerId } from '@timeflies/common';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { RoomCharacter } from './room-character';

type RoomTeamPlayerLineProps = {
    playerId: PlayerId;
    onCharacterListOpen: () => void;
};

const useStyles = makeStyles(({ palette, spacing }) => ({
    characterWrapper: {
        padding: spacing(1),
        outlineWidth: 1,
        outlineStyle: 'solid',
        outlineColor: palette.background.level1
    },
    addBtn: {
        minWidth: 0,
        width: 48,
        height: 48
    },
    addBtnIcon: {
        verticalAlign: 'text-bottom'
    }
}));

export const RoomTeamPlayerLine: React.FC<RoomTeamPlayerLineProps> = ({ playerId, onCharacterListOpen }) => {
    const classes = useStyles();
    const myPlayerId = useMyPlayerId();
    const playerName = useRoomSelector(state => state.staticPlayerList[ playerId ].playerName);
    const staticCharacterList = useRoomSelector(state => state.staticCharacterList);

    const isMyPlayer = myPlayerId === playerId;

    const characterIdList = ObjectTyped.entries(staticCharacterList)
        .filter(([ characterId, character ]) => character.playerId === playerId)
        .map(([ characterId ]) => characterId);

    return (
        <Grid container direction='column'>
            <Grid item>
                <UIText variant='body2'>{playerName}</UIText>
            </Grid>
            <Grid className={classes.characterWrapper} item>
                <Grid container spacing={1}>
                    {characterIdList.map(characterId => (
                        <Grid key={characterId} item>
                            <RoomCharacter characterId={characterId} />
                        </Grid>
                    ))}

                    {isMyPlayer && (
                        <Grid item>
                            <UIButton className={classes.addBtn} onClick={onCharacterListOpen}>
                                <AddIcon className={classes.addBtnIcon} />
                            </UIButton>
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </Grid>
    );
};
