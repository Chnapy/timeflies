import { Box, Paper } from '@material-ui/core';
import { UIButton, UIText } from '@timeflies/app-ui';
import React from 'react';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useRoomSelector } from '../hooks/use-room-selector';
import { RoomMapButton } from './room-map-button';
import { RoomMapList } from './room-map-list';

export const RoomMapPanel: React.FC = () => {
    const mapInfos = useRoomSelector(state => state.mapInfos);
    const myPlayerId = useMyPlayerId();
    const isAdmin = useRoomSelector(state => state.playerAdminId === myPlayerId);
    const isReady = useRoomSelector(state => state.staticPlayerList[myPlayerId].ready);
    const [ mapListOpen, setMapListOpen ] = React.useState(false);

    const disabled = !isAdmin || isReady;

    const onMapListClose = () => setMapListOpen(false);
    const onMapListOpen = () => setMapListOpen(true);

    return (
        <Paper>
            <Box p={2} pt={1}>
                <UIText variant='body1' align='center' gutterBottom>Map</UIText>

                {mapInfos
                    ? <RoomMapButton mapInfos={mapInfos} disabled={disabled} onClick={onMapListOpen} />
                    : (isAdmin
                        ? <UIButton onClick={onMapListOpen} disabled={disabled} fullWidth>select map</UIButton>
                        : <UIText variant='body2'>no map selected</UIText>)}

                <RoomMapList open={mapListOpen} onClose={onMapListClose} />
            </Box>
        </Paper>
    );
};
