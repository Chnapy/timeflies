import * as PIXI from 'pixi.js';
import { AssetLoader } from '../assetManager/AssetLoader';
import { GameStateStep } from '../game-state';
import { BattleStageGraphic } from '../stages/battle/graphic/BattleStageGraphic';
import { BootStageGraphic } from '../stages/boot/graphic/BootStageGraphic';
import { RoomStageGraphic } from '../stages/room/graphic/RoomStageGraphic';
import { StoreEmitter } from '../store/store-manager';
import { CanvasContext } from './CanvasContext';
import { StageGraphic, StageGraphicCreator } from './StageGraphic';

const stageGraphicsMap: Record<GameStateStep, StageGraphicCreator> = {
    boot: BootStageGraphic,
    room: RoomStageGraphic,
    battle: BattleStageGraphic
} as const;

export const GameCanvas = (view: HTMLCanvasElement, parent: HTMLElement, storeEmitter: StoreEmitter, assetLoader: AssetLoader) => {

    const renderer = PIXI.autoDetectRenderer({
        view,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio,
    });

    const rootStage = new PIXI.Container();

    let stageGraphic: StageGraphic | null = null;

    let currentMode: 'loop' | 'once';
    let currentLoop: number;

    const requestRender = (mode: 'loop' | 'once') => {
        const renderFn = () => {
            renderer.render(rootStage);
            if (mode === 'loop') {
                requestAnimationFrame(renderFn);
            }
        };

        currentMode = mode;

        cancelAnimationFrame(currentLoop);
        currentLoop = requestAnimationFrame(renderFn);
    };

    const onResize = () => {
        const { clientWidth, clientHeight } = parent;

        renderer.resize(clientWidth, clientHeight);
        stageGraphic?.onResize && stageGraphic.onResize(clientWidth, clientHeight);

        if (currentMode === 'once') {
            requestRender('once');
        }
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

            requestRender(
                step === 'battle' ? 'loop' : 'once'
            );
        }
    );
};
