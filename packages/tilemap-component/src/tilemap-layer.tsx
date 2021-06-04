import { Tile } from '@timeflies/tilemap-utils';
import React from 'react';
import { Container } from 'react-pixi-fiber';
import { TiledLayerTilelayer } from 'tiled-types';
import { TilemapCharacters, TilemapCommonProps } from './tilemap-common-props';
import { TilemapTile } from './tilemap-tile';

export type TilemapLayerProps = TilemapCommonProps & {
    layer: TiledLayerTilelayer;
    interactive?: boolean;
    characters?: TilemapCharacters;
};

export const TilemapLayer: React.FC<TilemapLayerProps> = React.memo(({
    mapSheet, mapTexture, onTileMouseHover, layer, interactive = false, characters = {}
}) => {
    const layerData = layer.data as number[];

    return (
        <Container>
            {layerData.flatMap((id, index) => {
                const pos = Tile.getTilePositionFromIndex(index, mapSheet);

                const children = characters[ pos.id ] ?? [];

                return [
                    ...children,
                    <TilemapTile
                        key={layer.name + ':' + index}
                        id={id}
                        index={index}
                        mapSheet={mapSheet}
                        mapTexture={mapTexture}
                        onTileMouseHover={onTileMouseHover}
                        layer={layer}
                        interactive={interactive}
                    />
                ];
            })}
        </Container>
    );
});
