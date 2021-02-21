import { useTheme } from '@material-ui/core';
import { createCache } from '@timeflies/cache';
import { colorStringToHex, createPosition, Position } from '@timeflies/common';
import { Layer, Tile } from '@timeflies/tilemap-utils';
import * as PIXI from 'pixi.js';
import React from 'react';
import { Container, CustomPIXIComponent, DisplayObjectProps, Sprite } from 'react-pixi-fiber';
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

const TileHighlight = CustomPIXIComponent<PIXI.Graphics, DisplayObjectProps<PIXI.Graphics> & { color: number | null; alpha: number | null; }>({
    customDisplayObject: () => new PIXI.Graphics(),
    customApplyProps: function (this: { applyDisplayObjectProps: (...args: any[]) => void }, graphics, oldProps, newProps) {
        const { color, alpha, x = 0, y = 0, width, height } = newProps;

        graphics.clear();
        if (color) {
            graphics.beginFill(color, alpha);
            graphics.drawRect(x, y, width!, height!);
            graphics.endFill();
        }
    }
}, 'TileHighlight');

export type TilemapComponentProps = {
    mapSheet: TiledMap;
    mapTexture: { [ name: string ]: PIXI.Texture };
    onTileMouseHover: (tilePos: Position | null) => void;
    tilesRange: Position[ 'id' ][];
    tilesAction: Position[ 'id' ][];
    tilesCurrentAction: Position[ 'id' ][];

    children: {
        [ position in string ]?: {
            id: string;
            sprite: React.ReactElement;
        }
    };
};

export const TilemapComponent: React.FC<TilemapComponentProps> = ({
    mapSheet, mapTexture, onTileMouseHover, tilesRange, tilesAction, tilesCurrentAction, children
}) => {

    const { width, height } = mapSheet;

    const tileStatesColors = useTheme().palette.tileStates;
    const rangeColor = colorStringToHex(tileStatesColors.range);
    const actionColor = colorStringToHex(tileStatesColors.action);

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

    const getTileHighlight = (tilePos: Position, size: number) => {
        const isRange = tilesRange.includes(tilePos.id);
        const isAction = tilesAction.includes(tilePos.id);
        const isCurrentAction = tilesCurrentAction.includes(tilePos.id);

        const mainColor = isAction || isCurrentAction
            ? actionColor
            : (isRange
                ? rangeColor
                : null);
        const mainAlpha = isAction
            ? 0.75
            : (isRange
                ? 0.5
                : (isCurrentAction
                    ? 0.25
                    : 0));

        const innerColor = isAction && isRange
            ? rangeColor
            : null;
        const innerAlpha = isAction && isRange
            ? 0.75
            : 0;

        const innerSize = size * 2 / 3;
        const innerPos = (size - innerSize) / 2;

        return (
            <Container>
                <TileHighlight width={size} height={height} color={mainColor} alpha={mainAlpha} />
                <TileHighlight x={innerPos} y={innerPos} width={innerSize} height={innerSize} color={innerColor} alpha={innerAlpha} />
            </Container>
        );
    };

    const getTileGraphic = (id: number, index: number, layer: TiledLayerTilelayer, interactive: boolean = false) => {

        const tileset = Tile.getTilesetFromTileId(id, mapSheet);
        if (!tileset) {
            return null;
        }

        const texture = getTextureFromId(id, tileset);

        const tilePos = Tile.getTilePositionFromIndex(index, mapSheet);
        const worldPos = Tile.getWorldPositionFromTilePosition(tilePos, tileset, layer);

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

        const tileHighlight = interactive
            ? getTileHighlight(tilePos, tileheight)
            : null;

        return <Container
            key={layer.name + ':' + worldPos.x + ':' + worldPos.y}
            x={worldPos.x}
            y={worldPos.y}
            interactive={interactive}
            mouseover={() => {
                onTileMouseHover(tilePos);
            }}
        >
            {sprite}
            {tileHighlight}
        </Container>;
    };

    const backgroundLayer = Layer.getTilelayer('background', mapSheet);
    const obstaclesLayer = Layer.getTilelayer('obstacles', mapSheet);
    const foregroundLayerList = Layer.getForegroundLayers(mapSheet);

    const useRenderLayer = (layerList: TiledLayerTilelayer[], interactive?: boolean) => {
        return React.useMemo(
            () => layerList.map(layer => (
                <Container key={layer.name}>
                    {(layer.data as number[])
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

                const tile = getTileGraphic((obstaclesLayer.data as number[])[ index ], index, obstaclesLayer);
                if (tile) {
                    tiles.push(tile);
                }
            }
        }

        return <Container>
            {tiles}
        </Container>;
    };

    return <Container interactive mouseout={() => onTileMouseHover(null)}>
        {background}
        {renderObstaclesAndEntities()}
        {foreground}
    </Container>;
};
