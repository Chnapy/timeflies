import { assertIsDefined } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { serviceEvent } from '../services/serviceEvent';
import { BattleStageGraphic } from '../stages/battle/graphic/BattleStageGraphic';
import { BootStageGraphic } from '../stages/boot/graphic/BootStageGraphic';
import { RoomStageGraphic } from '../stages/room/graphic/RoomStageGraphic';
import { StageKey, StageOnCreateGraphicAction } from '../stages/StageManager';
import { StageChangeAction } from '../stages/stage-actions';
import { CanvasContextMap } from './CanvasContext';
import { StageGraphic, StageGraphicCreator } from './StageGraphic';

const stageGraphicsMap = {
    boot: BootStageGraphic,
    room: RoomStageGraphic,
    battle: BattleStageGraphic
} as const;

export type StageGraphicCreateParam<SK extends StageKey> = (typeof stageGraphicsMap)[ SK ] extends StageGraphicCreator<infer K>
    ? Pick<CanvasContextMap, K>
    : never;

export interface GameCanvas {
}

let renderFn: () => void = () => { };

let shouldRender: boolean = false;

export const requestRender = () => {
    if (!shouldRender) {
        shouldRender = true;
        requestAnimationFrame(renderFn);
    }
};

export const GameCanvas = (view: HTMLCanvasElement, parent: HTMLElement): GameCanvas => {

    const { onAction } = serviceEvent();

    const renderer = PIXI.autoDetectRenderer({
        view,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio,
    });

    const rootStage = new PIXI.Container();

    let stageGraphic: StageGraphic<any> | null = null;

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

    onAction<StageChangeAction<any>>('stage/change', ({ payload: { stageKey } }) => {
        rootStage.removeChildren().forEach(c => c.destroy());

        stageGraphic = stageGraphicsMap[ stageKey ](renderer);

        rootStage.addChild(stageGraphic!.getContainer());
        requestRender();
    });

    onAction<StageOnCreateGraphicAction<any>>('stage/onCreate/graphic', ({ param }) => {

        assertIsDefined(stageGraphic);

        stageGraphic!.onCreate(param);
    });

    return {};
};
