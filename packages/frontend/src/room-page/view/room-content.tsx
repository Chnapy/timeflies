import { Grid } from '@material-ui/core';
import { RoomPlayerJoinMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import useAsyncEffect from 'use-async-effect';
import { routes } from '../../routes';
import { useGameSelector } from '../../store/hooks/use-game-selector';
import { useSendRoomUpdate } from '../hooks/use-send-room-update';
import { RoomMapPanel } from '../room-map-button/room-map-panel';
import { RoomNoTeamPlayerList } from '../room-no-team-player-list/room-no-team-player-list';
import { RoomTeamList } from '../room-team/room-team-list';

export const RoomContent: React.FC = () => {
    const { roomId } = useRouteMatch(routes.roomPage({}))!.params as { roomId: string };
    const sendRoomUpdate = useSendRoomUpdate();
    const hasRoomState = useGameSelector(state => !!state.room);

    useAsyncEffect(async (isMounted) => {
        await sendRoomUpdate(RoomPlayerJoinMessage({ roomId }), isMounted);
    }, []);

    if (!hasRoomState) {
        return null;
    }

    return <Grid container spacing={2}>

        <Grid item>
            <Grid container direction='column' alignItems='flex-start'>

                <Grid item>
                    <RoomMapPanel />
                </Grid>

            </Grid>
        </Grid>

        <Grid item xs>
            <Grid container direction='column' spacing={1}>

                <Grid item>
                    <RoomNoTeamPlayerList />
                </Grid>

                <Grid item>
                    <RoomTeamList />
                </Grid>

            </Grid>
        </Grid>

    </Grid>;
};
