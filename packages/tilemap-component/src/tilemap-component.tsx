import { createCache } from '@timeflies/cache';
import { createPosition } from '@timeflies/common';
import { Layer, Tile } from '@timeflies/tilemap-utils';
import * as PIXI from 'pixi.js';
import React from 'react';
import { Container, CustomPIXIComponent, Sprite } from 'react-pixi-fiber';
import { TiledLayerTilelayer, TiledMap, TiledTileset } from 'tiled-types';

const textureCache = createCache<number, PIXI.Texture>();

const AnimatedSprite = CustomPIXIComponent({
    customDisplayObject: ({ frameObjects }: {
        frameObjects: PIXI.AnimatedSprite.FrameObject[]
    }) => {
        const sprite = new PIXI.AnimatedSprite(frameObjects, true);
        sprite.play();

        return sprite;
    }
}, 'AnimatedSprite');

export type TilemapComponentProps = {
    mapSheet: TiledMap;
    mapTexture: { [ name: string ]: PIXI.Texture };
    children: {
        [ position in string ]?: {
            id: string;
            sprite: React.ReactElement;
        }
    };
};

export const TilemapComponent: React.FC<TilemapComponentProps> = ({ mapSheet, mapTexture, children }) => {

    const { width, height } = mapSheet;

    const getTextureFromId = (id: number, tileset: TiledTileset): PIXI.Texture => textureCache.getOrElse(id, () => {

        const tilesetTexture = mapTexture[ tileset.name ];

        const texture = tilesetTexture.clone();

        const idIndex = id - tileset.firstgid;
        const { x, y } = Tile.getWorldPositionFromTilePosition(
            Tile.getTilePositionFromIndex(idIndex, mapSheet),
            tileset
        );

        texture.frame = new PIXI.Rectangle(x, y, tileset.tilewidth, tileset.tileheight);
        texture.updateUvs();
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        return texture;
    });

    const getTileGraphic = (id: number, index: number, layer: TiledLayerTilelayer, interactive?: boolean) => {

        const tileset = Tile.getTilesetFromTileId(id, mapSheet);
        if (!tileset) {
            return null;
        }

        const texture = getTextureFromId(id, tileset);

        const worldPos = Tile.getWorldPositionFromTilePosition(
            Tile.getTilePositionFromIndex(index, mapSheet), tileset, layer
        );

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

        return <Container key={layer.name + ':' + worldPos.x + ':' + worldPos.y} x={worldPos.x} y={worldPos.y} interactive={interactive}>
            {sprite}
        </Container>;
    };

    const backgroundLayer = Layer.getTilelayer('background', mapSheet);
    const obstaclesLayer = Layer.getTilelayer('obstacles', mapSheet);
    const foregroundLayerList = Layer.getForegroundLayers(mapSheet);

    const useRenderLayer = (layerList: TiledLayerTilelayer[], interactive?: boolean) => {
        return React.useMemo(
            () => layerList.map(layer => (
                <Container key={layer.name}>
                    {layer.data
                        .map((d, i) => getTileGraphic(d, i, layer, interactive))}
                </Container>)),
            [
                ...layerList.flatMap(layer => [ layer.name, layer.data ]),
                interactive
            ]
        );
    };

    const background = useRenderLayer([ backgroundLayer ], true);

    const foreground = useRenderLayer(foregroundLayerList);

    const renderObstaclesAndEntities = () => {
        const tiles: React.ReactElement[] = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const position = createPosition(x, y);

                const child = children[ position.id ];
                if (child) {
                    tiles.push(<Container key={child.id}>
                        {child.sprite}
                    </Container>);
                }

                const tile = getTileGraphic(obstaclesLayer.data[ index ], index, obstaclesLayer);
                if (tile) {
                    tiles.push(tile);
                }
            }
        }

        return <Container>
            {tiles}
        </Container>;
    };

    return <Container>
        {background}
        {renderObstaclesAndEntities()}
        {foreground}
    </Container>;
};
