import { Viewport } from 'pixi-viewport';
import { CanvasContext } from '../../../canvas/CanvasContext';
import { StageGraphicCreator } from '../../../canvas/StageGraphic';
import { CharactersBoard } from './charactersBoard/CharactersBoard';
import { TiledMapGraphic } from './tiledMap/TiledMapGraphic';
import { requestRender } from '../../../canvas/GameCanvas';

export const BattleStageGraphic: StageGraphicCreator = (renderer) => {

    const viewport = new Viewport({
        screenWidth: renderer.screen.width,
        screenHeight: renderer.screen.height,
        disableOnContextMenu: false,

        interaction: renderer.plugins.interaction
    });

    const initViewport = (worldWidth: number, worldHeight: number) => {
        viewport.worldWidth = worldWidth;
        viewport.worldHeight = worldHeight;
        viewport
            .clamp({ direction: 'all' })
            .clampZoom({
                minScale: 0.25,
                maxScale: 1,

            })
            .wheel()
            .drag({
                mouseButtons: 'middle',
            });

        let isDragging = false;

        viewport.on('wheel', requestRender);
        viewport.on('drag-start', () => isDragging = true);
        viewport.on('drag-end', () => isDragging = false);
        viewport.on('moved', () => isDragging && requestRender());
    };

    const tiledMapGraphic = TiledMapGraphic();

    const { storeEmitter } = CanvasContext.consumer('storeEmitter');

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

            requestRender();
        }
    );

    CanvasContext.provider({ tiledMapGraphic }, () => {

        const charactersBoardCurrent = CharactersBoard('current');
        const charactersBoardFuture = CharactersBoard('future');

        viewport.addChild(
            tiledMapGraphic.container,
            charactersBoardCurrent.container,
            charactersBoardFuture.container,
            tiledMapGraphic.containerOver
        );
        requestRender();
    });

    return {
        container: viewport,

        onResize(width, height) {
            viewport.resize(width, height);
        },
    };
};
