import { assertIsDefined } from '@timeflies/shared';
import * as PIXI from 'pixi.js';
import { serviceEvent } from '../services/serviceEvent';
import { BattleStageGraphic } from '../stages/battle/graphic/BattleStageGraphic';
import { BootStageGraphic } from '../stages/boot/graphic/BootStageGraphic';
import { RoomStageGraphic } from '../stages/room/graphic/RoomStageGraphic';
import { StageChangeAction, StageKey, StageOnCreateGraphicAction } from '../stages/StageManager';
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

export const GameCanvas = (view: HTMLCanvasElement, parent: HTMLElement): GameCanvas => {

    const { onAction } = serviceEvent();

    const canvas = new PIXI.Application({
        view,
        resizeTo: parent,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio,
        
    });

    let stageGraphic: StageGraphic<any>;

    onAction<StageChangeAction<any>>('stage/change', ({ stageKey }) => {
        canvas.stage.removeChildren();

        stageGraphic = stageGraphicsMap[ stageKey ](canvas.renderer);

        canvas.stage.addChild(stageGraphic.getContainer());
    });

    onAction<StageOnCreateGraphicAction<any>>('stage/onCreate/graphic', ({ param }) => {

        assertIsDefined(stageGraphic);

        stageGraphic.onCreate(param);
    });

    return {};
};
