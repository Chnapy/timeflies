import { IGameAction } from '../action/game-action/GameAction';
import { AssetMap } from '../assetManager/AssetLoader';
import { serviceDispatch } from '../services/serviceDispatch';
import { serviceEvent } from '../services/serviceEvent';
import { BattleStage, BattleStageParam } from './battle/BattleStage';
import { BootStage, BootStageParam } from './boot/BootStage';
import { StageGraphicCreateParam } from '../canvas/GameCanvas';
import { RoomStageParam, RoomStage } from './room/RoomStage';

export interface StageChangeAction<K extends StageKey> extends IGameAction<'stage/change'> {
    stageKey: K;
    payload: ExtractPayload<K>;
}

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

type ExtractPayload<K extends StageKey> = Extract<StageParams, { stageKey: K }>[ 'payload' ];

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
        dispatchStageChange: <K extends StageKey>(stageKey: K, payload: ExtractPayload<K>): StageChangeAction<StageKey> => ({
            type: 'stage/change',
            stageKey,
            payload
        }),
        dispatchStageOnCreateGraphic: (param: StageGraphicCreateParam<any>): StageOnCreateGraphicAction<any> => ({
            type: 'stage/onCreate/graphic',
            param
        })
    });

    const goToStage = async ({ stageKey, payload }: StageParams) => {
        currentStage = stageCreators[ stageKey ](payload as any);

        console.log('Stage change:', stageKey);

        const assets = await currentStage.preload();

        await currentStage.create(assets, dispatchStageOnCreateGraphic);
    };

    const { onAction } = serviceEvent();

    onAction<StageChangeAction<any>>('stage/change', goToStage);

    dispatchStageChange('boot', {});

    return {};
};
