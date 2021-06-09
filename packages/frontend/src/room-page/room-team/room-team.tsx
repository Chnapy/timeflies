import { Grid, makeStyles, Paper } from '@material-ui/core';
import { UIButton } from '@timeflies/app-ui';
import { ObjectTyped } from '@timeflies/common';
import { RoomTeamJoinMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';
import { RoomTeamPlayerLine } from './room-team-player-line';

export type RoomTeamProps = {
    teamColor: string;
};

const useStyles = makeStyles(({ spacing }) => ({
    root: ({ teamColor }: Pick<RoomTeamProps, 'teamColor'>) => ({
        borderLeftWidth: 8,
        borderLeftStyle: 'solid',
        borderLeftColor: teamColor,
        padding: spacing(1)
    })
}));

export const RoomTeam: React.FC<RoomTeamProps> = React.memo(({ teamColor }) => {
    const classes = useStyles({ teamColor });

    const sendRoomUpdate = useSendRoomUpdate();
    const myPlayerId = useMyPlayerId();
    const isMyTeam = useRoomSelector(state => state.staticPlayerList[ myPlayerId ].teamColor === teamColor);
    const staticPlayerList = useRoomSelector(state => state.staticPlayerList);
    const playerIdList = ObjectTyped.entries(staticPlayerList)
        .filter(([ playerId, player ]) => player.teamColor === teamColor)
        .map(([ playerId ]) => playerId);

    const onTeamJoin = () => sendRoomUpdate(RoomTeamJoinMessage({ teamColor }));

    return (
        <Paper className={classes.root}>
            <Grid container direction='column' spacing={1}>

                {playerIdList.map(playerId => (
                    <Grid key={playerId} item>
                        <RoomTeamPlayerLine
                            key={playerId}
                            playerId={playerId}
                        />
                    </Grid>
                ))}

                {!isMyTeam && (
                    <Grid item>
                        <UIButton onClick={onTeamJoin} fullWidth>
                            join
                </UIButton>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
});
