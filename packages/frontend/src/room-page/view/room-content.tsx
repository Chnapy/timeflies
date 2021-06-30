import { Grid, makeStyles } from '@material-ui/core';
import { useSocketListeners, useSocketSend } from '@timeflies/socket-client';
import { RoomBattleStartMessage, RoomPlayerJoinMessage, RoomPlayerLeaveMessage, RoomStateMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import useAsyncEffect from 'use-async-effect';
import { ChatPanel } from '../../components/chat-panel/chat-panel';
import { LoadingBackdrop } from '../../components/loading-backdrop';
import { NotFoundPanel } from '../../components/not-found-panel';
import { useSocketSendWithResponseError } from '../../connected-socket/hooks/use-socket-send-with-response-error';
import { routes } from '../../routes';
import { useGameSelector } from '../../store/hooks/use-game-selector';
import { RoomButtonsPanel } from '../room-buttons/room-buttons-panel';
import { RoomMapPanel } from '../room-map-button/room-map-panel';
import { RoomSpectatorPlayerList } from '../room-spectator-player-list/room-spectator-player-list';
import { RoomTeamList } from '../room-team/room-team-list';
import { RoomSetAction } from '../store/room-actions';

const useStyles = makeStyles(() => ({
    leftColumn: {
        display: 'flex'
    },
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
    const send = useSocketSend();
    const sendWithResponse = useSocketSendWithResponseError();
    const addSocketListeners = useSocketListeners();
    const dispatch = useDispatch();
    const history = useHistory();
    const hasRoomState = useGameSelector(state => !!state.room);
    const [ hasWrongId, setHasWrongId ] = React.useState(false);

    useAsyncEffect(async (isMounted) => {
        const response = await sendWithResponse(RoomPlayerJoinMessage({ roomId }), isMounted, ({ payload }, defaultFn) => {
            if (payload.reason === 'bad-request') {
                setHasWrongId(true);
                return;
            }

            defaultFn();
        });
        if (!response) {
            return;
        }

        const { payload } = response;
        if ('battleId' in payload) {
            history.push(routes.battlePage({ battleId: payload.battleId }).path);
            return;
        } else {
            dispatch(RoomSetAction(payload));
        }

        return await addSocketListeners({
            [ RoomStateMessage.action ]: ({ payload }: ReturnType<typeof RoomStateMessage>) => {
                dispatch(RoomSetAction(payload));
            },
            [ RoomBattleStartMessage.action ]: ({ payload }: ReturnType<typeof RoomBattleStartMessage>) => {
                history.push(routes.battlePage({ battleId: payload.battleId }).path);
            }
        });
    },
        removeListeners => {
            if (removeListeners) {
                removeListeners();
            }
            dispatch(RoomSetAction(null));
            return send(RoomPlayerLeaveMessage({}));
        },
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

    return <Grid container wrap='nowrap' spacing={2}>

        <Grid className={classes.leftColumn} item zeroMinWidth>
            <Grid container direction='column' alignItems='stretch' spacing={1}>

                <Grid item>
                    <RoomMapPanel />
                </Grid>

                <Grid item xs>
                    <ChatPanel stayFocused />
                </Grid>

            </Grid>
        </Grid>

        <Grid className={classes.teamListWrapper} item xs>
            <Grid container direction='column' wrap='nowrap' spacing={1}>

                <RoomSpectatorPlayerList />

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
