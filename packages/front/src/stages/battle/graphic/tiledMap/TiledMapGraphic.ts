import { assertIsDefined, Position, TiledLayerTilelayer, TiledManager, TiledTileset } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { serviceEvent } from '../../../../services/serviceEvent';
import { SpellEngineBindAction } from '../../engine/Engine';
import { CanvasContext } from '../../../../canvas/CanvasContext';

export interface TiledMapGraphic {
    readonly container: PIXI.Container;
}

export const TiledMapGraphic = (): TiledMapGraphic => {

    const { mapManager: { tiledManager } } = CanvasContext.consumer('mapManager');

    const { onAction } = serviceEvent();

    let onTileClick: (p: Position) => void = () => { };
    let onTileHover: (p: Position) => void = () => { };
    onAction<SpellEngineBindAction>('battle/spell-engine/bind', ({ onTileClick: otc, onTileHover: oth }) => {
        onTileClick = otc;
        onTileHover = oth;
    });

    const { schema, images } = tiledManager.assets;

    const { layers } = schema;

    const mapTexture: Record<string, PIXI.Texture> = Object.keys(images).reduce((m, k) => {
        m[ k ] = PIXI.Texture.from(images[ k ]);
        return m;
    }, {});

    const tilelayers = layers.filter((l): l is TiledLayerTilelayer => l.type === 'tilelayer');

    const textureCache: Partial<Record<number, PIXI.Texture>> = {};

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

    const Tile = (id: number, index: number): PIXI.Sprite | null => {

        const tileset = tiledManager.getTilesetFromId(id);
        if (!tileset) {
            return null;
        }

        const texture = getTextureFromId(id, tileset);

        const tilePos = tiledManager.getTilePositionFromIndex(index);
        const worldPos = getWorldPositionFromIndex(index, tileset);

        const sprite = PIXI.Sprite.from(texture);
        sprite.x = worldPos.x;
        sprite.y = worldPos.y;
        sprite.width = tileset.tilewidth;
        sprite.height = tileset.tileheight;

        sprite.interactive = true;
        sprite.on('mouseup', () => onTileClick(tilePos));
        sprite.on('mouseover', () => onTileHover(tilePos));

        return sprite;
    };

    const layersContainers: PIXI.Container[] = tilelayers
        .map(({ data }) => {
            assertIsDefined(data);

            const tiles: PIXI.Sprite[] = data
                .map(Tile)
                .filter((tile): tile is PIXI.Sprite => tile !== null);

            const container = new PIXI.Container();
            container.scale.set(0.5, 0.5);

            container.addChild(...tiles);
            return container;
        });

    const container = new PIXI.Container();
    container.addChild(...layersContainers);

    return {
        container
    };
};
