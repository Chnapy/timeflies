import { assertIsDefined, assertThenGet, equals, Position, SpellType } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { TiledTileset } from 'tiled-types';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { serviceEvent } from '../../../../services/serviceEvent';
import { BStateAction } from '../../battleState/BattleStateSchema';
import { SpellEngineBindAction } from '../../engine/Engine';
import { ExtractHoverReturn, getTiledMapSpellObject } from '../../engine/spellMapping';
import { TileGraphic } from './TileGraphic';
import { SpellActionTimerEndAction, SpellActionTimerStartAction } from '../../spellAction/SpellActionTimer';
import { serviceBattleData } from '../../../../services/serviceBattleData';

export interface TiledMapGraphic {
    readonly container: PIXI.Container;
    readonly containerOver: PIXI.Container;

    readonly width: number;
    readonly height: number;
    readonly tilewidth: number;
    readonly tileheight: number;
    getWorldFromTile(tilePosition: Position): Position;
}

export interface TileHoverFnProps<ST extends SpellType> {
    engineProps: NonNullable<ExtractHoverReturn<ST>>;
    tileGraphicList: TileGraphic[];
    rangeTiles: TileGraphic[];
    duration: number;
}

export interface TileTriggerFn {
    onTileHover: (tilePos: Position, tileGraphic: TileGraphic) => void;
    onTileClick: (tilePos: Position) => void;
}

export const TiledMapGraphic = (): TiledMapGraphic => {

    const { mapManager: { tiledManager } } = CanvasContext.consumer('mapManager');

    const { onAction } = serviceEvent();

    const triggerFn: TileTriggerFn = {
        onTileHover: () => { },
        onTileClick: () => { }
    };

    const { schema, images } = tiledManager.assets;

    const mapTexture: Record<string, PIXI.Texture> = Object.keys(images).reduce((m, k) => {
        m[ k ] = PIXI.Texture.from(images[ k ]);
        return m;
    }, {});

    const textureCache: Partial<Record<number, PIXI.Texture>> = {};

    const getWorldFromTile = ({ x, y }: Position): Position => ({
        x: x * schema.tilewidth,
        y: y * schema.tileheight
    });

    const getWorldPositionFromIndex = (index: number, { tilewidth, tileheight }: TiledTileset): Position => {
        const tilePos = tiledManager.getTilePositionFromIndex(index);
        return {
            x: tilePos.x * tilewidth,
            y: tilePos.y * tileheight
        };
    };

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
            tileheight,
            triggerFn
        });
    };

    const renderableLayer = tiledManager.getRenderableLayer();

    const layerTiles: TileGraphic[] = assertThenGet(renderableLayer.data, assertIsDefined)
        .map(getTileGraphic)
        .filter((tile): tile is TileGraphic => tile !== null);

    const layerContainer = new PIXI.Container();
    layerContainer.addChild(...layerTiles.map(t => t.container));

    const layerContainerOver = new PIXI.Container();
    layerContainerOver.addChild(...layerTiles.map(t => t.containerOver));

    const container = new PIXI.Container();
    container.addChild(layerContainer);

    const containerOver = new PIXI.Container();
    containerOver.addChild(layerContainerOver);

    onAction<SpellEngineBindAction>('battle/spell-engine/bind', ({
        spell, rangeArea, onTileClick: otc, onTileHover: oth
    }) => {

        layerTiles.forEach(t => t.reset());

        const rangeTiles = rangeArea.map(pos => {
            const tile = layerTiles.find(t => equals(t.tilePos)(pos));
            assertIsDefined(tile);
            tile.showRange();
            return tile;
        });

        triggerFn.onTileClick = otc;

        triggerFn.onTileHover = async (tilePos, tileGraphicTarget) => {

            const engineProps = await oth(tilePos);

            layerTiles.forEach(t => t.reset());

            if (spell.staticData.type === 'move') {

            } else {

                rangeTiles.forEach(t => t.showRange());

                const isInArea = rangeTiles.some(t => equals(tileGraphicTarget.tilePos)(t.tilePos));
                if (!isInArea) {
                    return;
                }
            }

            if (engineProps) {
                const { onHoverFn } = getTiledMapSpellObject(spell.staticData.type);

                const afterClick = onHoverFn({
                    engineProps: engineProps as any,
                    tileGraphicList: layerTiles,
                    rangeTiles,
                    duration: spell.feature.duration
                });

                triggerFn.onTileClick = async tilePos => {
                    const isTargetable = await otc(tilePos);

                    if(!isTargetable) {
                        return;
                    }

                    const { spellActionSnapshotList } = serviceBattleData('future');

                    const { startTime } = spellActionSnapshotList[ spellActionSnapshotList.length - 1 ]

                    afterClick(startTime);
                };
            }
        };
    });

    onAction<SpellActionTimerStartAction>('battle/spell-action/start', ({
        spellActionSnapshot: { spellId, position, actionArea, startTime, duration }
    }) => {

        const { globalTurn } = serviceBattleData('cycle');
        assertIsDefined(globalTurn);

        const spell = globalTurn.currentTurn.character.spells.find(s => s.id === spellId);
        assertIsDefined(spell);

        const { onSpellStartFn } = getTiledMapSpellObject(spell.staticData.type);

        onSpellStartFn({
            tileGraphicList: layerTiles,
            startTime,
            position,
            actionArea,
            duration
        });
    });

    onAction<SpellActionTimerEndAction>('battle/spell-action/end', ({
        spellActionSnapshot: { startTime }, removed
    }) => {
        layerTiles.forEach(t => t.clearPersist(startTime, removed));
    });

    onAction<BStateAction>('battle/state/event', action => {

        if (action.eventType === 'TURN-END') {

            triggerFn.onTileHover = () => { };
            triggerFn.onTileClick = () => { };

            layerTiles.forEach(t => {
                t.reset();
                t.clearPersist();
            });
        }
    });

    return {
        container,
        containerOver,
        width: schema.width,
        height: schema.height,
        tilewidth: schema.tilewidth,
        tileheight: schema.tileheight,
        getWorldFromTile
    };
};
