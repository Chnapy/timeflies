import { Tile } from '@timeflies/tilemap-utils';
import * as PIXI from 'pixi.js';
import React from 'react';
import { Container, CustomPIXIComponent, Sprite } from 'react-pixi-fiber';
import { TiledLayerTilelayer } from 'tiled-types';
import { TilemapCommonProps } from './tilemap-common-props';
import { textureFromIdGetter } from './utils/texture-from-id-getter';
import { tileInfosGetter } from './utils/tile-infos-getter';

const AnimatedSprite = CustomPIXIComponent({
    customDisplayObject: ({ frameObjects }: {
        frameObjects: PIXI.AnimatedSprite.FrameObject[]
    }) => {
        const sprite = new PIXI.AnimatedSprite(frameObjects, true);
        sprite.play();

        return sprite;
    }
}, 'AnimatedSprite');

export type TilemapTileProps = TilemapCommonProps & {
    id: number;
    index: number;
    layer: TiledLayerTilelayer;
    interactive: boolean;
};

export const TilemapTile: React.FC<TilemapTileProps> = ({
    id, index, mapSheet, mapTexture, onTileMouseHover, layer, interactive
}) => {
    const getTextureFromId = textureFromIdGetter({ mapSheet, mapTexture });
    const getTileInfos = tileInfosGetter({ mapSheet, layer });

    const tileInfos = getTileInfos(id, index);
    if (!tileInfos) {
        return null;
    }

    const { tileset, tilePos, worldPos } = tileInfos;

    const texture = getTextureFromId(id, tileset);

    const { tilewidth, tileheight } = tileset;

    const animationFrameObjects = Tile.getTileAnimation(id, tileset);

    const sprite = animationFrameObjects
        ? <AnimatedSprite
            frameObjects={animationFrameObjects.map(({ tileid, duration }): PIXI.AnimatedSprite.FrameObject => ({
                texture: getTextureFromId(tileid, tileset),
                time: duration
            }))}
        />
        : <Sprite texture={texture} width={tilewidth} height={tileheight} />;

    return <Container
        x={worldPos.x}
        y={worldPos.y}
        interactive={interactive}
        mouseover={() => {
            onTileMouseHover(tilePos);
        }}
    >
        {sprite}
    </Container>;
};
