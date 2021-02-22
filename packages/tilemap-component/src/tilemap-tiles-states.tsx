import React from 'react';
import { Container } from 'react-pixi-fiber';
import { TiledLayerTilelayer } from 'tiled-types';
import { TilemapCommonProps, TilemapTileState } from './tilemap-common-props';
import { TilemapTileHighlight } from './tilemap-tile-highlight';
import { tileInfosGetter } from './utils/tile-infos-getter';

export type TilemapTilesStatesProps = Pick<TilemapCommonProps, 'mapSheet'> & {
    backgroundLayer: TiledLayerTilelayer;
    tilesRange: TilemapTileState;
    tilesAction: TilemapTileState;
    tilesCurrentAction: TilemapTileState;
};

export const TilemapTilesStates: React.FC<TilemapTilesStatesProps> = ({
    mapSheet, backgroundLayer, tilesRange, tilesAction, tilesCurrentAction
}) => {
    const getTileInfos = tileInfosGetter({ mapSheet, layer: backgroundLayer });

    const layerName = 'tile-states';

    return (
        <Container>
            {(backgroundLayer.data as number[])
                .map((id, index) => {
                    const tileInfos = getTileInfos(id, index);
                    if (!tileInfos) {
                        return null;
                    }

                    const { worldPos, tilePos, tileset } = tileInfos;

                    return <Container
                        key={layerName + ':' + worldPos.x + ':' + worldPos.y}
                        x={worldPos.x}
                        y={worldPos.y}
                    >
                        <TilemapTileHighlight
                            isRange={tilesRange[ tilePos.id ]}
                            isAction={tilesAction[ tilePos.id ]}
                            isCurrentAction={tilesCurrentAction[ tilePos.id ]}
                            size={tileset.tileheight}
                        />
                    </Container>;
                })}
        </Container>
    );
};
