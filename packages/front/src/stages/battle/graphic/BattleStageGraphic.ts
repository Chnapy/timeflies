import { Viewport } from 'pixi-viewport';
import { CanvasContext } from '../../../canvas/CanvasContext';
import { StageGraphicCreator } from '../../../canvas/StageGraphic';
import { CharactersBoard } from './charactersBoard/CharactersBoard';
import { TiledMapGraphic } from './tiledMap/TiledMapGraphic';
import { assertIsDefined } from '@timeflies/shared';
import { createViewportListener } from './viewport-listener';

export const BattleStageGraphic: StageGraphicCreator = (renderer) => {

    const viewport = new Viewport({
        screenWidth: renderer.screen.width,
        screenHeight: renderer.screen.height,
        disableOnContextMenu: false,

        interaction: renderer.plugins.interaction
    });

    const viewportListener = createViewportListener(viewport);

    const initViewport = (worldWidth: number, worldHeight: number) => {
        viewport.worldWidth = worldWidth;
        viewport.worldHeight = worldHeight;

        const ratioWidth = Math.ceil(window.innerWidth / worldWidth);
        const ratioHeight = Math.ceil(window.innerHeight / worldHeight);

        viewport
            .clamp({ direction: 'all' })
            .clampZoom({
                minScale: Math.min(ratioWidth, ratioHeight)
            })
            .wheel()
            .drag({
                mouseButtons: 'middle',
            });
    };

    const tiledMapGraphic = TiledMapGraphic();

    const { storeEmitter, assetLoader } = CanvasContext.consumer('storeEmitter', 'assetLoader');

    storeEmitter.onStateChange(
        state => state.battle.battleActionState.tiledSchema,
        schema => {
            if (!schema) {
                return;
            }

            const { width, height } = tiledMapGraphic.getMapsize(schema);
            const { tilewidth, tileheight } = tiledMapGraphic.getTilesize(schema);

            initViewport(
                tilewidth * width,
                tileheight * height
            );
        }
    );

    const charactersSpritesheet = assetLoader.get('characters')!;
    assertIsDefined(charactersSpritesheet);

    CanvasContext.provider({
        viewportListener,
        tiledMapGraphic,
        spritesheets: { characters: charactersSpritesheet.spritesheet }
    }, () => {

        const charactersBoardCurrent = CharactersBoard('current');
        const charactersBoardFuture = CharactersBoard('future');

        viewport.addChild(
            tiledMapGraphic.container,
            charactersBoardCurrent.container,
            charactersBoardFuture.container,
            tiledMapGraphic.containerOver
        );
    });

    return {
        container: viewport,

        onResize(width, height) {
            viewport.resize(width, height);
        },
    };
};
