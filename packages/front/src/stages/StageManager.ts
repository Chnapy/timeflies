import { IGameAction } from '../action/GameAction';
import { AssetMap } from '../assetManager/AssetLoader';
import { Controller } from '../Controller';
import { serviceDispatch } from '../services/serviceDispatch';
import { serviceEvent } from '../services/serviceEvent';
import { BattleStage, BattleStageParam } from './battle/BattleStage';
import { BootStage, BootStageParam } from './boot/BootStage';
import { LoadStage, LoadStageParam } from './load/LoadStage';
import { StageGraphicCreateParam } from '../canvas/GameCanvas';

export interface StageChangeAction<K extends StageKey> extends IGameAction<'stage/change'> {
    stageKey: K;
    payload: ExtractPayload<K>;
}

export interface StageChangeGraphicAction extends IGameAction<'stage/change/graphic'> {
    stageKey: StageKey;
}

export interface StageOnCreateGraphicAction<K extends StageKey> extends IGameAction<'stage/onCreate/graphic'> {
    param: StageGraphicCreateParam<K>;
}

export type StageAction =
    | StageChangeAction<any>
    | StageChangeGraphicAction
    | StageOnCreateGraphicAction<any>;

export interface StageParam<K extends string, P extends {}> {
    stageKey: K;
    payload: P;
}

type ExtractPayload<K extends StageKey> = Extract<StageParams, { stageKey: K }>[ 'payload' ];

type StageParams = BootStageParam | LoadStageParam | BattleStageParam;

export type StageKey = StageParams[ 'stageKey' ];

export interface StageCreator<SK extends StageKey, K extends keyof AssetMap> {
    (payload: ExtractPayload<SK>): Stage<SK, K>;
}

export interface Stage<SK extends StageKey, K extends keyof AssetMap> {
    preload(): { [ key in K ]?: string };
    create(assets: Pick<AssetMap, K>): Promise<StageGraphicCreateParam<SK>>;
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

    let currentStage: Stage<any, never>;

    const { dispatchStageChangeGraphic, dispatchStageOnCreateGraphic } = serviceDispatch({
        dispatchStageChangeGraphic: (stageKey: StageKey): StageChangeGraphicAction => ({
            type: 'stage/change/graphic',
            stageKey
        }),
        dispatchStageOnCreateGraphic: (param: StageGraphicCreateParam<any>): StageOnCreateGraphicAction<any> => ({
            type: 'stage/onCreate/graphic',
            param
        })
    })

    const goToStage = async ({ stageKey, payload }: StageParams) => {
        currentStage = stageCreators[ stageKey ](payload as any);

        console.log('Stage change:', stageKey);

        dispatchStageChangeGraphic(stageKey);

        const assetsToLoad = currentStage.preload();

        const assets = await Controller.loader.newInstance()
            .addMultiple(assetsToLoad)
            .load();

        const graphicCreateParam = await currentStage.create(assets);

        dispatchStageOnCreateGraphic(graphicCreateParam);
    };

    goToStage({ stageKey: 'boot', payload: {} });

    const { onAction } = serviceEvent();

    onAction<StageChangeAction<any>>('stage/change', goToStage);

    return {};
};
