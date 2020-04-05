import { assertIsDefined, Position, TiledLayerTilelayer, TiledTileset, SpellType } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { CanvasContext } from '../../../../canvas/CanvasContext';
import { serviceEvent } from '../../../../services/serviceEvent';
import { SpellEngineBindAction } from '../../engine/Engine';
import { getTiledMapHoverFn, ExtractHoverReturn } from '../../engine/spellMapping';
import { TileGraphic } from './TileGraphic';

export interface TiledMapGraphic {
    readonly container: PIXI.Container;

    readonly width: number;
    readonly height: number;
    readonly tilewidth: number;
    readonly tileheight: number;
    getWorldFromTile(tilePosition: Position): Position;
}

export interface TileHoverFnProps<ST extends SpellType> {
    engineProps: NonNullable<ExtractHoverReturn<ST>>;
    tileGraphicTarget: TileGraphic;
    tileGraphicList: TileGraphic[];
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

    const tilelayers = schema.layers.filter((l): l is TiledLayerTilelayer => l.type === 'tilelayer');

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

    const layersTiles: TileGraphic[][] = tilelayers
        .map(({ data }) => {
            assertIsDefined(data);

            return data
                .map(getTileGraphic)
                .filter((tile): tile is TileGraphic => tile !== null);
        });

    const layersContainers: PIXI.Container[] = layersTiles.map(tiles => {

        const container = new PIXI.Container();

        container.addChild(...tiles.map(t => t.container));
        return container;
    });

    const container = new PIXI.Container();
    container.addChild(...layersContainers);

    onAction<SpellEngineBindAction>('battle/spell-engine/bind', ({ spellType, onTileClick: otc, onTileHover: oth }) => {
        triggerFn.onTileClick = otc;
        triggerFn.onTileHover = async (tilePos, tileGraphicTarget) => {
            const engineProps = await oth(tilePos);

            const tileGraphicList = layersTiles[ layersTiles.length - 1 ];
            tileGraphicList.forEach(t => t.reset());
            
            if (engineProps) {
                const hoverFn = getTiledMapHoverFn(spellType);

                hoverFn({
                    engineProps,
                    tileGraphicTarget,
                    tileGraphicList
                });
            }
        };
    });

    return {
        container,
        width: schema.width,
        height: schema.height,
        tilewidth: schema.tilewidth,
        tileheight: schema.tileheight,
        getWorldFromTile
    };
};
