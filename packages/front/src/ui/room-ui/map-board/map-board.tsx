import Box from '@material-ui/core/Box';
import { assertIsDefined } from '@timeflies/shared';
import React from 'react';
import { useGameStep } from '../../hooks/useGameStep';
import { MapBoardTile } from './map-board-tile/map-board-tile';
import { Card, CardContent } from '@material-ui/core';

export const MapBoard: React.FC = () => {

    const mapSelected = useGameStep('room', room => room.map.mapSelected);
    const map = useGameStep('room', room => {
        return room.map.mapList.find(m => m.id === mapSelected?.id);
    });

    if (!mapSelected) {
        return null;
    }

    assertIsDefined(map);

    const { width, height } = map;

    const borderWidth = 2;

    return <Card>
        <CardContent>
            <Box position='relative' width={width * 64 + borderWidth * 2} height={height * 64 + borderWidth * 2} bgcolor='common.white' border={borderWidth} borderRadius={4}>
                {mapSelected.tileList.map((tileInfos) => {
                    const { position: { x, y } } = tileInfos;

                    return (
                        <Box key={`${x}:${y}`} position='absolute' left={64 * x} top={64 * y} width={64} height={64}>
                            <MapBoardTile tileInfos={tileInfos} />
                        </Box>
                    );
                })}
            </Box>
        </CardContent>
    </Card>;
};
