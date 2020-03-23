import { IGameAction } from '../action/GameAction';
import { AssetMap } from '../assetManager/AssetLoader';
import { StageGraphic } from '../canvas/StageGraphic';
import { Controller } from '../Controller';
import { serviceDispatch } from '../services/serviceDispatch';
import { serviceEvent } from '../services/serviceEvent';
import { BattleStage, BattleStageParam } from './battle/BattleStage';
import { BootStage, BootStageParam } from './boot/BootStage';
import { LoadStage, LoadStageParam } from './load/LoadStage';

export interface StageChangeAction<K extends StageKey> extends IGameAction<'stage/change'> {
    stageKey: K;
    payload: ExtractPayload<K>;
}

export interface StageChangeGraphicAction extends IGameAction<'stage/change/graphic'> {
    stageGraphic: StageGraphic;
}

export type StageAction =
    | StageChangeAction<any>
    | StageChangeGraphicAction;

export interface StageParam<K extends string, P extends {}> {
    stageKey: K;
    payload: P;
}

type ExtractPayload<K extends StageKey> = Extract<StageParams, { stageKey: K }>[ 'payload' ];

type StageParams = BootStageParam | LoadStageParam | BattleStageParam;

export type StageKey = StageParams[ 'stageKey' ];

export interface StageCreator<SK extends StageKey, K extends keyof AssetMap> {
    (payload: ExtractPayload<SK>): Stage<K>;
}

export interface Stage<K extends keyof AssetMap> {
    graphic: StageGraphic;
    preload(): { [ key in K ]?: string };
    create(assets: Pick<AssetMap, K>): void;
}

export interface StageManager {
}

interface Dependencies {
    stageCreators: {
        [ K in StageKey ]: StageCreator<K, any> | StageCreator<K, never>;
    };
}

export const StageManager = ({ stageCreators }: Dependencies = {
    stageCreators: {
        boot: BootStage,
        load: LoadStage,
        battle: BattleStage
    }
}): StageManager => {

    let currentStage: Stage<never>;

    const { dispatchStageChangeGraphic } = serviceDispatch({
        dispatchStageChangeGraphic: (stageGraphic: StageGraphic): StageChangeGraphicAction => ({
            type: 'stage/change/graphic',
            stageGraphic
        })
    })

    const goToStage = async ({ stageKey, payload }: StageParams) => {
        currentStage = stageCreators[ stageKey ](payload as any);

        console.log('Stage change:', stageKey);

        dispatchStageChangeGraphic(currentStage.graphic);

        const assetsToLoad = currentStage.preload();

        const assets = await Controller.loader.newInstance()
            .addMultiple(assetsToLoad)
            .load();

        currentStage.create(assets);
    };
 
    goToStage({ stageKey: 'boot', payload: {} });

    const { onAction } = serviceEvent();

    onAction<StageChangeAction<any>>('stage/change', goToStage);

    return {};
};
