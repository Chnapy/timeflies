import Box from '@material-ui/core/Box';
import { Position, TileTypeWithPlacement } from '@timeflies/shared';
import React from 'react';
import { MapBoardTilePlacement, MapBoardTilePlacementProps } from './map-board-tile-placement';

export type MapBoardTileInfos<T extends Extract<TileTypeWithPlacement, 'placement' | 'obstacle'> = 'placement' | 'obstacle'> = {
    obstacle: {
        type: Extract<TileTypeWithPlacement, 'obstacle'>;
        position: Position;
    };
    placement: {
        type: Extract<TileTypeWithPlacement, 'placement'>;
    } & MapBoardTilePlacementProps;
}[ T ];

export interface MapBoardTileProps {
    tileInfos: MapBoardTileInfos;
}

export const MapBoardTile: React.FC<MapBoardTileProps> = ({ tileInfos }) => {

    return <Box display='flex' flexShrink={0} width={64} height={64}>
        {tileInfos.type === 'obstacle'
            ? <MapBoardTileObstacle {...tileInfos} />
            : <MapBoardTilePlacement {...tileInfos} />}
    </Box>;
};

const MapBoardTileObstacle: React.FC<MapBoardTileInfos<'obstacle'>> = props => {

    return <Box flexGrow={1} bgcolor='#444' />;
};
