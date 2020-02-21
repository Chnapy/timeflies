import { BattleLoadEndedCAction, BattleSnapshot, BRunLaunchSAction, GlobalTurnSnapshot } from "@timeflies/shared";
import { AssetManager } from "../../assetManager/AssetManager";
import { BattleLaunchAction } from "../../phaser/battleReducers/BattleReducerManager";
import { CharacterGraphic } from "../battle/graphics/CharacterGraphic";
import { SpellGraphic } from "../battle/graphics/SpellGraphic";
import { serviceDispatch } from "../../services/serviceDispatch";
import { serviceEvent } from "../../services/serviceEvent";
import { SendMessageAction } from "../../socket/WSClient";
import { BattleScene } from "../battle/BattleScene";
import { LoadScene } from "./LoadScene";

export interface LoadStage {
    onPreload(): void;
    onCreate(): void;
}

type Scene = Pick<LoadScene, 'initData' | 'start'> & {
    load: Pick<LoadScene['load'], 'image' | 'tilemapTiledJSON' | 'atlasXML'>;
};

export const LoadStage = ({ initData, load, start }: Scene): LoadStage => {

    return {
        onPreload() {
            const payload = initData;
            const { mapInfos, characterTypes } = payload;
            const { urls } = mapInfos;

            // map tiles
            load.image('tiles', urls.sheet);

            // map in json format
            load.tilemapTiledJSON('map', urls.schema);

            characterTypes.forEach(type => {
                const { image, schema } = AssetManager.characters[type];

                load.atlasXML(CharacterGraphic.getSheetKey(type), image, schema);
            });

            load.atlasXML(SpellGraphic.getSheetKey(), AssetManager.spells.image, AssetManager.spells.schema);
        },
        onCreate() {

            const { onAction, onMessageAction } = serviceEvent();

            const { sendBattleLoadEnded, sendBattleLaunch } = serviceDispatch({
                sendBattleLoadEnded: (): SendMessageAction<BattleLoadEndedCAction> => ({
                    type: 'message/send',
                    message: {
                        type: 'battle-load-end'
                    }
                }),
                sendBattleLaunch: (battleSnapshot: BattleSnapshot, globalTurnState: GlobalTurnSnapshot): BattleLaunchAction => ({
                    type: 'battle/launch',
                    battleSceneData: {
                        ...initData,
                        battleSnapshot,
                        battleData: {
                            launchTime: battleSnapshot.launchTime,
                            teams: [],
                            players: [],
                            characters: []
                        },
                        globalTurnState
                    }
                })
            });

            onAction<BattleLaunchAction>('battle/launch', ({
                battleSceneData
            }) => {
                start<BattleScene>('BattleScene', battleSceneData);
            });

            sendBattleLoadEnded();

            onMessageAction<BRunLaunchSAction>('battle-run/launch', ({
                battleSnapshot, globalTurnState
            }) => {
                sendBattleLaunch(battleSnapshot, globalTurnState);
            });
        }
    };
};
