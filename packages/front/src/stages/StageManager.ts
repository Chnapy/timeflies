import { IGameAction } from '../action/game-action/GameAction';
import { AssetMap } from '../assetManager/AssetLoader';
import { serviceDispatch } from '../services/serviceDispatch';
import { serviceEvent } from '../services/serviceEvent';
import { BattleStage, BattleStageParam } from './battle/BattleStage';
import { BootStage, BootStageParam } from './boot/BootStage';
import { StageGraphicCreateParam } from '../canvas/GameCanvas';
import { RoomStageParam, RoomStage } from './room/RoomStage';
import { StageChangeAction } from './stage-actions';

export interface StageOnCreateGraphicAction<K extends StageKey> extends IGameAction<'stage/onCreate/graphic'> {
    param: StageGraphicCreateParam<K>;
}

export type StageAction =
    | StageChangeAction<StageKey>
    | StageOnCreateGraphicAction<StageKey>;

export interface StageParam<K extends string, P extends {}> {
    stageKey: K;
    payload: P;
}

export type ExtractPayload<K extends StageKey> = Extract<StageParams, { stageKey: K }>[ 'payload' ];

type StageParams = BootStageParam | RoomStageParam | BattleStageParam;

export type StageKey = StageParams[ 'stageKey' ];

export interface StageCreator<SK extends StageKey, K extends keyof AssetMap> {
    (payload: ExtractPayload<SK>): Stage<SK, K>;
}

export interface Stage<SK extends StageKey, K extends keyof AssetMap> {
    preload(): Promise<Pick<AssetMap, K>>;
    create(assets: Pick<AssetMap, K>, setupStageGraphic: (param: StageGraphicCreateParam<SK>) => void): Promise<void>;
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
        room: RoomStage,
        battle: BattleStage
    }
}): StageManager => {

    let currentStage: Stage<any, never>;

    const { dispatchStageChange, dispatchStageOnCreateGraphic } = serviceDispatch({
        dispatchStageChange: (stageKey: StageKey, payload: ExtractPayload<StageKey>) => StageChangeAction({
            stageKey,
            data: payload
        }) as any,
        dispatchStageOnCreateGraphic: (param: StageGraphicCreateParam<any>): StageOnCreateGraphicAction<any> => ({
            type: 'stage/onCreate/graphic',
            param
        })
    });

    const goToStage = async ({ payload: { stageKey, data } }: StageChangeAction) => {
        currentStage = stageCreators[ stageKey ](data as any);

        console.log('Stage change:', stageKey);

        const assets = await currentStage.preload();

        await currentStage.create(assets, dispatchStageOnCreateGraphic);
    };

    const { onAction } = serviceEvent();

    onAction<StageChangeAction>('stage/change', goToStage);

    dispatchStageChange('boot', {});

    return {};
};
