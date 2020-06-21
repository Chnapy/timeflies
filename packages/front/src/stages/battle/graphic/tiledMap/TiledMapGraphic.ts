import { Position, TiledManager, createPosition } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { shallowEqual } from 'react-redux';
import TiledMap, { TiledTileset } from 'tiled-types';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { requestRender } from '../../../../canvas/GameCanvas';
import { graphicTheme } from '../graphic-theme';
import { tiledMapSpellMove, tiledMapSpellSimpleAttack } from './tiledSpellFns';
import { TileGraphic } from './TileGraphic';
import { Normalized, normalize } from '../../entities/normalize';

export type TiledMapGraphic = ReturnType<typeof TiledMapGraphic>;

export interface TileHoverFnProps {
    tileGraphicList: TileGraphic[];
    rangeTiles: TileGraphic[];
    duration: number;
}

export const TiledMapGraphic = () => {

    const textureCache: Partial<Record<number, PIXI.Texture>> = {};

    const container = new PIXI.Container();

    const containerOver = new PIXI.Container();

    const layerTiles: TileGraphic[] = [];
    const layerTilesMap: Normalized<TileGraphic> = {};

    const { storeEmitter } = CanvasContext.consumer('storeEmitter');

    const getTilesize = (tiledSchema: TiledMap) => {
        const { tilewidth, tileheight } = tiledSchema;

        return {
            tilewidth,
            tileheight
        };
    };

    const getMapsize = (tiledSchema: TiledMap) => {
        const { width, height } = tiledSchema;

        return {
            width,
            height
        };
    };

    const getWorldFromTile = (tiledSchema: TiledMap, { x, y }: Position): Position => {
        const { tilewidth, tileheight } = getTilesize(tiledSchema);

        return createPosition(
            x * tilewidth,
            y * tileheight
        );
    };

    storeEmitter.onStateChange(
        ({ battle: { battleActionState } }) => ({
            schema: battleActionState.tiledSchema,
            images: battleActionState.tiledImagesUrls
        }),
        ({ schema, images }) => {
            container.removeChildren().forEach(c => c.destroy());
            containerOver.removeChildren().forEach(c => c.destroy());
            layerTiles.splice(0, Infinity);
            for (const k in layerTilesMap) {
                delete layerTilesMap[ k ];
            }

            if (!schema || !images) {
                return;
            }

            const tiledManager = TiledManager(schema);

            const mapTexture: Record<string, PIXI.Texture> = Object.keys(images).reduce((m, k) => {
                m[ k ] = PIXI.Texture.from(images[ k ]);
                return m;
            }, {});

            const getTextureFromId = (id: number, tileset: TiledTileset): PIXI.Texture => {

                if (textureCache[ id ]) {
                    return textureCache[ id ]!;
                }

                const tilesetTexture = mapTexture[ tileset.name ];

                const texture = tilesetTexture.clone();

                const idIndex = id - tileset.firstgid;
                const { x, y } = getWorldPositionFromIndex(idIndex, tileset);

                texture.frame = new PIXI.Rectangle(y, x, tileset.tilewidth, tileset.tileheight);
                texture.updateUvs();
                texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

                textureCache[ id ] = texture;

                return texture;
            };

            const getWorldPositionFromIndex = (index: number, { tilewidth, tileheight }: TiledTileset): Position => {
                const tilePos = tiledManager.getTilePositionFromIndex(index);

                return createPosition(
                    tilePos.x * tilewidth,
                    tilePos.y * tileheight
                );
            };

            const getTileGraphic = (id: number, index: number): TileGraphic | null => {

                const tileset = tiledManager.getTilesetFromId(id);
                if (!tileset) {
                    return null;
                }

                const texture = getTextureFromId(id, tileset);

                const tilePos = tiledManager.getTilePositionFromIndex(index);
                const worldPos = getWorldPositionFromIndex(index, tileset);

                const { tilewidth, tileheight } = tileset;

                return TileGraphic({
                    texture,
                    tilePos,
                    worldPos,
                    tilewidth,
                    tileheight
                });
            };

            const renderableLayer = tiledManager.getRenderableLayer();

            layerTiles.push(
                ...renderableLayer.data
                    .map(getTileGraphic)
                    .filter((tile): tile is TileGraphic => tile !== null)
            );

            Object.assign(layerTilesMap, normalize(layerTiles));

            const layerContainer = new PIXI.Container();
            layerContainer.addChild(...layerTiles.map(t => t.container));

            const layerContainerOver = new PIXI.Container();
            layerContainerOver.addChild(...layerTiles.map(t => t.containerOver));

            const { palette } = graphicTheme;

            const gridGraphic = new PIXI.Graphics();
            gridGraphic.lineStyle(1, palette.primary.main, 0.1);
            for (let y = 0; y < schema.height; y++) {
                gridGraphic.moveTo(0, y * schema.tileheight);
                gridGraphic.lineTo(schema.width * schema.tilewidth, y * schema.tileheight);
            }
            for (let x = 0; x < schema.width; x++) {
                gridGraphic.moveTo(x * schema.tilewidth, 0);
                gridGraphic.lineTo(x * schema.tilewidth, schema.height * schema.tileheight);
            }

            container.addChild(layerContainer, gridGraphic);

            containerOver.addChild(layerContainerOver);

            requestRender();
        },
        shallowEqual
    );

    storeEmitter.onStateChange(
        ({ battle: { snapshotState } }) => {
            const currentSpellAction = snapshotState.spellActionSnapshotList.find(s =>
                s.startTime <= Date.now() && s.startTime + s.duration > Date.now());

            if (!currentSpellAction) {
                return null;
            }

            const spellType = snapshotState.battleDataFuture.spells[ currentSpellAction.spellId ].staticData.type;

            return {
                currentSpellAction,
                spellType
            };
        },
        spellActionInfos => {
            if (spellActionInfos) {
                const { currentSpellAction, spellType } = spellActionInfos;

                const startFn = spellType === 'move'
                    ? tiledMapSpellMove
                    : tiledMapSpellSimpleAttack;

                startFn.onSpellStartFn({
                    ...currentSpellAction,
                    tileGraphicList: layerTilesMap,
                });
            }
        },
        shallowEqual
    );

    return {
        container,
        containerOver,
        getMapsize,
        getTilesize,
        getWorldFromTile
    };
};
