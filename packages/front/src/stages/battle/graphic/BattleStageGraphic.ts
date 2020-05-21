import { Viewport } from 'pixi-viewport';
import * as PIXI from 'pixi.js';
import { CanvasContext } from '../../../canvas/CanvasContext';
import { StageGraphicCreator } from '../../../canvas/StageGraphic';
import { CharactersBoard } from './charactersBoard/CharactersBoard';
import { TiledMapGraphic } from './tiledMap/TiledMapGraphic';

export const BattleStageGraphic: StageGraphicCreator<'mapManager' | 'spritesheets'> = (renderer) => {

    const viewport = new Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        disableOnContextMenu: false,

        interaction: renderer.plugins.interaction
    });

    const initViewport = ({ width, height, tilewidth, tileheight }: TiledMapGraphic) => {
        viewport.screenWidth = window.innerWidth;
        viewport.screenHeight = window.innerHeight;
        viewport.worldWidth = tilewidth * width;
        viewport.worldHeight = tileheight * height;
        viewport
            .clamp({ direction: 'all' })
            .clampZoom({
                minWidth: tilewidth * 4,
                minHeight: tileheight * 4,
                maxWidth: viewport.worldWidth,
                maxHeight: viewport.worldHeight,
            })
            .wheel()
            .drag({
                mouseButtons: 'middle',
            });
    };

    const textStyle = new PIXI.TextStyle({
        fill: 'white'
    });
    const text = new PIXI.Text('Battle stage', textStyle);
    viewport.addChild(text);

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
                });
            });
        },
        getContainer() {
            return viewport;
        }
    };
};
