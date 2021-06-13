import { Grid, makeStyles } from '@material-ui/core';
import { useSocketListeners } from '@timeflies/socket-client';
import { RoomBattleStartMessage, RoomPlayerJoinMessage, RoomStateMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import useAsyncEffect from 'use-async-effect';
import { LoadingBackdrop } from '../../components/loading-backdrop';
import { NotFoundPanel } from '../../components/not-found-panel';
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
    const [ hasWrongId, setHasWrongId ] = React.useState(false);

    useAsyncEffect(async (isMounted) => {
        await sendRoomUpdate(
            RoomPlayerJoinMessage({ roomId }),
            isMounted,
            ({ payload }, defaultFn) => {
                if (payload.code === 400) {
                    setHasWrongId(true);
                    return;
                }

                defaultFn();
            }
        );

        return await addSocketListeners({
            [ RoomStateMessage.action ]: ({ payload }: ReturnType<typeof RoomStateMessage>) => {
                dispatch(RoomSetAction(payload));
            },
            [ RoomBattleStartMessage.action ]: ({ payload }: ReturnType<typeof RoomBattleStartMessage>) => {
                dispatch(RoomSetAction(null));
                history.push(routes.battlePage({ battleId: payload.battleId }).path);
            }
        });
    },
        removeListeners => removeListeners && removeListeners(),
        []);

    if (hasWrongId) {
        return <NotFoundPanel
            title='Oops, there is no room here.'
            reasons={[
                'No more players in the room, so it does not exist anymore',
                'URL is wrong, if you paste it from outside'
            ]}
        />;
    }

    if (!hasRoomState) {
        return <LoadingBackdrop />;
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
