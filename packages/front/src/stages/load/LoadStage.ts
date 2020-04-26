import { BattleLoadPayload, BattleSnapshot, BRunLaunchSAction, GlobalTurnSnapshot } from "@timeflies/shared";
import { IGameAction } from '../../action/game-action/GameAction';
import { Controller } from '../../Controller';
import { serviceDispatch } from "../../services/serviceDispatch";
import { serviceEvent } from "../../services/serviceEvent";
import { serviceNetwork } from "../../services/serviceNetwork";
import charactersSpritesheetPath from '../../_assets/spritesheets/sokoban.json';
import { BattleSceneData } from '../battle/BattleStage';
import { StageChangeAction, StageCreator, StageParam } from '../StageManager';

export interface LoadLaunchAction extends IGameAction<'load/launch'> {
    payload: BattleLoadPayload;
}

export interface BattleLaunchAction extends IGameAction<'battle/launch'> {
    battleSceneData: BattleSceneData;
}

export type LoadAction =
    | LoadLaunchAction
    | BattleLaunchAction;

export type LoadStageParam = StageParam<'load', BattleLoadPayload>;

const spritesheetsUrls = {
    characters: charactersSpritesheetPath
} as const;

export const LoadStage: StageCreator<'load', 'map' | 'characters'> = (payload) => {
    const { mapConfig } = payload;

    return {
        preload: () => {
            const { schemaUrl } = mapConfig;

            return Controller.loader.newInstance()
                .add('map', schemaUrl)
                .addSpritesheet('characters', spritesheetsUrls.characters)
                .load();
        },
        async create(assets, setupStageGraphic) {

            const { onAction, onMessageAction } = serviceEvent();

            const { dispatchStageChangeToBattle, dispatchBattleLaunch } = serviceDispatch({
                dispatchStageChangeToBattle: (payload: BattleSceneData): StageChangeAction<'battle'> => ({
                    type: 'stage/change',
                    stageKey: 'battle',
                    payload
                }),
                dispatchBattleLaunch: (battleSnapshot: BattleSnapshot, globalTurnState: GlobalTurnSnapshot): BattleLaunchAction => ({
                    type: 'battle/launch',
                    battleSceneData: {
                        ...payload,
                        battleSnapshot,
                        battleData: {
                            cycle: {
                                launchTime: battleSnapshot.launchTime
                            },
                            current: {
                                battleHash: '',
                                teams: [],
                                players: [],
                                characters: []
                            },
                            future: {
                                battleHash: '',
                                teams: [],
                                players: [],
                                characters: [],
                                spellActionSnapshotList: []
                            }
                        },
                        globalTurnState
                    }
                })
            });

            onAction<BattleLaunchAction>('battle/launch', ({
                battleSceneData
            }) => {
                dispatchStageChangeToBattle(battleSceneData);
            });

            const { sendBattleLoadEnded } = await serviceNetwork({
                sendBattleLoadEnded: () => ({
                    type: 'battle-load-end'
                })
            });

            sendBattleLoadEnded();

            onMessageAction<BRunLaunchSAction>('battle-run/launch', ({
                battleSnapshot, globalTurnState
            }) => {
                dispatchBattleLaunch(battleSnapshot, globalTurnState);
            });

            setupStageGraphic({});
        }
    };
};
