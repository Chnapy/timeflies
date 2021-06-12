import { Grid, makeStyles, Paper } from '@material-ui/core';
import { UIText } from '@timeflies/app-ui';
import { ObjectTyped } from '@timeflies/common';
import React from 'react';
import { useRoomSelector } from '../hooks/use-room-selector';

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        padding: spacing(0.5, 1)
    }
}));

export const RoomNoTeamPlayerList: React.FC = () => {
    const classes = useStyles();

    const staticPlayerList = useRoomSelector(state => state.staticPlayerList);
    const playerNameList = ObjectTyped.entries(staticPlayerList)
        .filter(([ playerId, player ]) => player.teamColor === null)
        .map(([ playerId, player ]) => player.playerName);

    if (playerNameList.length === 0) {
        return null;
    }

    return <Grid item>
        <Paper className={classes.root}>
            <Grid container alignItems='baseline' spacing={1}>

                <Grid item>
                    <UIText variant='body1'>Not in team:</UIText>
                </Grid>

                {playerNameList.map(playerName => <Grid key={playerName} item>
                    <UIText variant='body2'>{playerName}</UIText>
                </Grid>)}

            </Grid>
        </Paper>
    </Grid>;
};
