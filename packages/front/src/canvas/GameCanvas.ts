import * as PIXI from 'pixi.js';
import { AssetLoader } from '../assetManager/AssetLoader';
import { GameStateStep } from '../game-state';
import { BattleStageGraphic } from '../stages/battle/graphic/BattleStageGraphic';
import { BootStageGraphic } from '../stages/boot/graphic/BootStageGraphic';
import { RoomStageGraphic } from '../stages/room/graphic/RoomStageGraphic';
import { StoreEmitter } from '../store-manager';
import { CanvasContext } from './CanvasContext';
import { StageGraphic, StageGraphicCreator } from './StageGraphic';

const stageGraphicsMap: Record<GameStateStep, StageGraphicCreator> = {
    boot: BootStageGraphic,
    room: RoomStageGraphic,
    battle: BattleStageGraphic
} as const;

let renderFn: () => void = () => { };

let shouldRender: boolean = false;

export const requestRender = () => {
    if (!shouldRender) {
        shouldRender = true;
        requestAnimationFrame(renderFn);
    }
};

export const GameCanvas = (view: HTMLCanvasElement, parent: HTMLElement, storeEmitter: StoreEmitter, assetLoader: AssetLoader) => {

    const renderer = PIXI.autoDetectRenderer({
        view,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio,
    });

    const rootStage = new PIXI.Container();

    let stageGraphic: StageGraphic | null = null;

    renderFn = () => {
        shouldRender = false;
        renderer.render(rootStage);
    };

    const onResize = () => {
        const { clientWidth, clientHeight } = parent;

        renderer.resize(clientWidth, clientHeight);
        stageGraphic?.onResize && stageGraphic.onResize(clientWidth, clientHeight);

        requestRender();
    };

    window.addEventListener('resize', onResize);

    onResize();

    storeEmitter.onStateChange(
        state => state.step,
        step => {
            rootStage.removeChildren().forEach(c => c.destroy());

            CanvasContext.provider({
                storeEmitter,
                assetLoader
            }, () => {
                stageGraphic = stageGraphicsMap[ step ](renderer);

                rootStage.addChild(stageGraphic!.container);
            });

            requestRender();
        }
    );
};
