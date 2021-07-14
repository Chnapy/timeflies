import { Grid, makeStyles, Paper } from '@material-ui/core';
import { UIButton } from '@timeflies/app-ui';
import { PlayerId } from '@timeflies/common';
import { ObjectTyped } from '@timeflies/common';
import { RoomAiAddMessage, RoomTeamJoinMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';
import { RoomTeamPlayerLine } from './room-team-player-line';

export type RoomTeamProps = {
    teamColor: string;
    onCharacterListOpen: (playerId: PlayerId) => void;
};

const useStyles = makeStyles(({ spacing }) => ({
    root: ({ teamColor }: Pick<RoomTeamProps, 'teamColor'>) => ({
        minWidth: 200,
        borderLeftWidth: 8,
        borderLeftStyle: 'solid',
        borderLeftColor: teamColor,
        padding: spacing(1)
    })
}));

export const RoomTeam: React.FC<RoomTeamProps> = React.memo(({ teamColor, onCharacterListOpen }) => {
    const classes = useStyles({ teamColor });

    const sendRoomUpdate = useSendRoomUpdate();
    const myPlayerId = useMyPlayerId();
    const isAdmin = useRoomSelector(state => state.playerAdminId === myPlayerId);
    const isReady = useRoomSelector(state => state.staticPlayerList[ myPlayerId ].ready);
    const isMyTeam = useRoomSelector(state => state.staticPlayerList[ myPlayerId ].teamColor === teamColor);
    const staticPlayerList = useRoomSelector(state => state.staticPlayerList);
    const playerIdList = ObjectTyped.entries(staticPlayerList)
        .filter(([ playerId, player ]) => player.teamColor === teamColor)
        .map(([ playerId ]) => playerId);

    const onAIAdd = () => sendRoomUpdate(RoomAiAddMessage({ teamColor }));

    const onTeamJoin = () => sendRoomUpdate(RoomTeamJoinMessage({ teamColor }));

    return (
        <Paper className={classes.root}>
            <Grid container direction='column' spacing={1}>

                {playerIdList.map(playerId => (
                    <Grid key={playerId} item>
                        <RoomTeamPlayerLine
                            key={playerId}
                            playerId={playerId}
                            onCharacterListOpen={() => onCharacterListOpen(playerId)}
                        />
                    </Grid>
                ))}

                {isAdmin && !isReady && (
                    <Grid item>
                        <UIButton onClick={onAIAdd} fullWidth size='small'>add AI</UIButton>
                    </Grid>
                )}

                {!isMyTeam && !isReady && (
                    <Grid item>
                        <UIButton onClick={onTeamJoin} fullWidth>join</UIButton>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
});
