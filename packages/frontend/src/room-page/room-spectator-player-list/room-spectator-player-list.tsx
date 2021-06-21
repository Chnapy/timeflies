import { Grid, makeStyles, Paper } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { UIButton, UIText } from '@timeflies/app-ui';
import { ObjectTyped } from '@timeflies/common';
import { RoomTeamJoinMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        padding: spacing(0.5, 1)
    },
    icon: {
        verticalAlign: 'middle'
    }
}));

export const RoomSpectatorPlayerList: React.FC = () => {
    const classes = useStyles();

    const sendRoomUpdate = useSendRoomUpdate();
    const myPlayerId = useMyPlayerId();
    const staticPlayerList = useRoomSelector(state => state.staticPlayerList);
    const isReady = useRoomSelector(state => state.staticPlayerList[ myPlayerId ].ready);
    const isSpectator = useRoomSelector(state => state.staticPlayerList[ myPlayerId ].type === 'spectator');

    const playerNameList = ObjectTyped.entries(staticPlayerList)
        .filter(([ playerId, player ]) => player.teamColor === null)
        .map(([ playerId, player ]) => player.playerName);

    const onSpectatorJoin = () => sendRoomUpdate(RoomTeamJoinMessage({ teamColor: null }));

    if (playerNameList.length === 0) {
        return null;
    }

    return <Grid item>
        <Paper className={classes.root}>
            <Grid container alignItems='center' spacing={1}>

                <Grid item>
                    <UIText variant='body1'>
                        <VisibilityIcon className={classes.icon} fontSize='inherit' />
                    </UIText>
                </Grid>

                <Grid item>
                    <UIText variant='body1'>Spectators:</UIText>
                </Grid>

                {playerNameList.map(playerName => <Grid key={playerName} item>
                    <UIText variant='body2'>{playerName}</UIText>
                </Grid>)}

                {!isSpectator && !isReady && <Grid item>
                    <UIButton onClick={onSpectatorJoin} size='small'>
                        join
                    </UIButton>
                </Grid>}

            </Grid>
        </Paper>
    </Grid>;
};
