import { Viewport } from 'pixi-viewport';
import { CanvasContext } from '../../../canvas/CanvasContext';
import { StageGraphicCreator } from '../../../canvas/StageGraphic';
import { CharactersBoard } from './charactersBoard/CharactersBoard';
import { TiledMapGraphic } from './tiledMap/TiledMapGraphic';
import { requestRender } from '../../../canvas/GameCanvas';

export const BattleStageGraphic: StageGraphicCreator<'mapManager' | 'spritesheets'> = (renderer) => {

    const viewport = new Viewport({
        screenWidth: renderer.screen.width,
        screenHeight: renderer.screen.height,
        disableOnContextMenu: false,

        interaction: renderer.plugins.interaction
    });

    const initViewport = ({ width, height, tilewidth, tileheight }: TiledMapGraphic) => {
        viewport.worldWidth = tilewidth * width;
        viewport.worldHeight = tileheight * height;
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

    return {
        onCreate(contextMap) {

            CanvasContext.provider(contextMap, () => {

                const tiledMapGraphic = TiledMapGraphic();

                initViewport(tiledMapGraphic);

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
            });
        },

        onResize(width, height) {
            viewport.resize(width, height);
        },

        getContainer() {
            return viewport;
        }
    };
};
