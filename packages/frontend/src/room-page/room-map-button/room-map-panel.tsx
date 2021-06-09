import { Box, Paper } from '@material-ui/core';
import { UIButton, UIText } from '@timeflies/app-ui';
import React from 'react';
import { useRoomSelector } from '../hooks/use-room-selector';
import { RoomMapButton } from './room-map-button';

export const RoomMapPanel: React.FC = () => {
    const mapInfos = useRoomSelector(state => state.mapInfos);

    return (
        <Paper>
            <Box p={2} pt={1}>
                <UIText variant='body1' align='center' gutterBottom>Map</UIText>

                {mapInfos
                    ? <RoomMapButton mapInfos={mapInfos} onClick={() => { }} />
                    : <UIButton>select map</UIButton>
                }
            </Box>
        </Paper>
    );
};
