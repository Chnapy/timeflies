import * as PIXI from 'pixi.js';
import { serviceEvent } from '../services/serviceEvent';
import { BattleStageGraphic } from '../stages/battle/graphic/BattleStageGraphic';
import { BootStageGraphic } from '../stages/boot/graphic/BootStageGraphic';
import { LoadStageGraphic } from '../stages/load/graphic/LoadStageGraphic';
import { StageKey, StageOnCreateGraphicAction, StageChangeAction } from '../stages/StageManager';
import { StageGraphicCreator, StageGraphic } from './StageGraphic';
import { CanvasContextMap } from './CanvasContext';
import { assertIsDefined } from '@timeflies/shared';

const stageGraphicsMap = {
    boot: BootStageGraphic,
    load: LoadStageGraphic,
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
        resizeTo: parent
    });

    let stageGraphic: StageGraphic<any>;

    onAction<StageChangeAction<any>>('stage/change', ({ stageKey }) => {
        canvas.stage.removeChildren();

        stageGraphic = stageGraphicsMap[ stageKey ]();

        canvas.stage.addChild(stageGraphic.getContainer());
    });

    onAction<StageOnCreateGraphicAction<any>>('stage/onCreate/graphic', ({ param }) => {

        assertIsDefined(stageGraphic);

        stageGraphic.onCreate(param);
    });

    return {};
};
