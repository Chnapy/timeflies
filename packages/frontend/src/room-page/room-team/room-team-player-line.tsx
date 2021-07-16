import { Grid, IconButton, makeStyles, Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CloseIcon from '@material-ui/icons/Close';
import { UIButton, UIText } from '@timeflies/app-ui';
import { ObjectTyped, PlayerId } from '@timeflies/common';
import { RoomAiRemoveMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';
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
    readyIcon: {
        width: '1.5rem',
        height: '1.5rem',
        verticalAlign: 'text-bottom'
    },
    addBtn: {
        minWidth: 0,
        width: 48,
        height: 48
    },
    addBtnIcon: {
        verticalAlign: 'text-bottom'
    },
    tooltipPopper: {
        zIndex: 0
    }
}));

export const RoomTeamPlayerLine: React.FC<RoomTeamPlayerLineProps> = ({ playerId, onCharacterListOpen }) => {
    const classes = useStyles();
    const myPlayerId = useMyPlayerId();
    const playerName = useRoomSelector(state => state.staticPlayerList[ playerId ].playerName);
    const isAI = useRoomSelector(state => state.staticPlayerList[ playerId ].type === 'ai');
    const isReady = useRoomSelector(state => state.staticPlayerList[ playerId ].ready);
    const staticCharacterList = useRoomSelector(state => state.staticCharacterList);
    const isMyPlayerReady = useRoomSelector(state => state.staticPlayerList[ myPlayerId ].ready);
    const sendRoomUpdate = useSendRoomUpdate();

    const isMyPlayer = myPlayerId === playerId;

    const isMyPlayerOrAI = isMyPlayer || isAI;

    const characterIdList = ObjectTyped.entries(staticCharacterList)
        .filter(([ characterId, character ]) => character.playerId === playerId)
        .map(([ characterId ]) => characterId);

    const onAIRemove = () => sendRoomUpdate(RoomAiRemoveMessage({ playerId }));

    return (
        <Grid container direction='column'>
            <Grid item container spacing={1}>
                <Grid item>
                    <Tooltip
                        classes={{ popper: classes.tooltipPopper }}
                        open={isAI}
                        arrow
                        title={<UIText variant='body2'>AI</UIText>}
                        placement="right"
                    >
                        <UIText variant='body2'>{playerName}</UIText>
                    </Tooltip>
                </Grid>
                {isReady && <Grid item>
                    <CheckCircleOutlineIcon className={classes.readyIcon} />
                </Grid>}
                {isAI && !isMyPlayerReady && <Grid item container xs justify='flex-end'>
                    <IconButton onClick={onAIRemove} size='small'>
                        <CloseIcon fontSize='inherit' />
                    </IconButton>
                </Grid>}
            </Grid>
            <Grid className={classes.characterWrapper} item>
                <Grid container spacing={1}>
                    {characterIdList.map(characterId => (
                        <Grid key={characterId} item>
                            <RoomCharacter characterId={characterId} />
                        </Grid>
                    ))}

                    {isMyPlayerOrAI && !isMyPlayerReady && (
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
