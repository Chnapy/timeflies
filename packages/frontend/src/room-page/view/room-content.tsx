import { Backdrop, Grid, makeStyles } from '@material-ui/core';
import CircularProgress from "@material-ui/core/CircularProgress";
import { useSocketListeners } from '@timeflies/socket-client';
import { RoomBattleStartMessage, RoomPlayerJoinMessage, RoomStateMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import useAsyncEffect from 'use-async-effect';
import { routes } from '../../routes';
import { useGameSelector } from '../../store/hooks/use-game-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';
import { RoomButtonsPanel } from '../room-buttons/room-buttons-panel';
import { RoomMapPanel } from '../room-map-button/room-map-panel';
import { RoomNoTeamPlayerList } from '../room-no-team-player-list/room-no-team-player-list';
import { RoomTeamList } from '../room-team/room-team-list';
import { RoomSetAction } from '../store/room-actions';

const useStyles = makeStyles(() => ({
    teamListWrapper: {
        display: 'flex',
        height: '100%'
    },
    teamList: {
        flexGrow: 1,
        overflowY: 'auto'
    }
}));

export const RoomContent: React.FC = () => {
    const classes = useStyles();
    const { roomId } = useRouteMatch(routes.roomPage({}))!.params as { roomId: string };
    const sendRoomUpdate = useSendRoomUpdate();
    const addSocketListeners = useSocketListeners();
    const dispatch = useDispatch();
    const history = useHistory();
    const hasRoomState = useGameSelector(state => !!state.room);

    useAsyncEffect(async (isMounted) => {
        await sendRoomUpdate(RoomPlayerJoinMessage({ roomId }), isMounted);

        await addSocketListeners({
            [ RoomStateMessage.action ]: ({ payload }: ReturnType<typeof RoomStateMessage>) => {
                dispatch(RoomSetAction(payload));
            },
            [ RoomBattleStartMessage.action ]: ({ payload }: ReturnType<typeof RoomBattleStartMessage>) => {
                dispatch(RoomSetAction(null));
                history.push(routes.battlePage({ battleId: payload.battleId }).path);
            }
        });
    }, []);

    if (!hasRoomState) {
        return <Backdrop open>
            <CircularProgress color='inherit' />
        </Backdrop>;
    }

    return <Grid container spacing={2}>

        <Grid item>
            <Grid container direction='column' alignItems='flex-start'>

                <Grid item>
                    <RoomMapPanel />
                </Grid>

            </Grid>
        </Grid>

        <Grid className={classes.teamListWrapper} item xs>
            <Grid container direction='column' wrap='nowrap' spacing={1}>

                <RoomNoTeamPlayerList />

                <Grid className={classes.teamList} item>
                    <RoomTeamList />
                </Grid>

                <Grid item>
                    <RoomButtonsPanel />
                </Grid>

            </Grid>
        </Grid>

    </Grid>;
};
