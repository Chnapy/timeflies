import Box from '@material-ui/core/Box';
import { Position, TileType } from '@timeflies/shared';
import React from 'react';
import { MapBoardTilePlacement, MapBoardTilePlacementProps } from './map-board-tile-placement';

export type MapBoardTileInfosType = Extract<TileType, 'obstacle'> | 'placement';

export type MapBoardTileInfos<T extends MapBoardTileInfosType = MapBoardTileInfosType> = {
    obstacle: {
        type: Extract<MapBoardTileInfosType, 'obstacle'>;
        position: Position;
    };
    placement: {
        type: Extract<MapBoardTileInfosType, 'placement'>;
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
