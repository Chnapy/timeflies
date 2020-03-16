import { BattleSnapshot, BRunLaunchSAction, GlobalTurnSnapshot } from "@timeflies/shared";
import { AssetManager } from "../../assetManager/AssetManager";
import { BattleLaunchAction } from "../../phaser/battleReducers/BattleReducerManager";
import { serviceDispatch } from "../../services/serviceDispatch";
import { serviceEvent } from "../../services/serviceEvent";
import { serviceNetwork } from "../../services/serviceNetwork";
import { BattleScene } from "../battle/BattleScene";
import { CharacterGraphic } from "../battle/graphics/CharacterGraphic";
import { SpellGraphic } from "../battle/graphics/SpellGraphic";
import { LoadScene } from "./LoadScene";

export interface LoadStage {
    onPreload(): void;
    onCreate(): Promise<void>;
}

type Scene = Pick<LoadScene, 'initData' | 'start'> & {
    load: Pick<LoadScene[ 'load' ], 'image' | 'tilemapTiledJSON' | 'atlasXML'>;
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
                const { image, schema } = AssetManager.characters[ type ];

                load.atlasXML(CharacterGraphic.getSheetKey(type), image, schema);
            });

            load.atlasXML(SpellGraphic.getSheetKey(), AssetManager.spells.image, AssetManager.spells.schema);
        },
        async onCreate() {

            const { onAction, onMessageAction } = serviceEvent();

            const { sendBattleLaunch } = serviceDispatch({
                sendBattleLaunch: (battleSnapshot: BattleSnapshot, globalTurnState: GlobalTurnSnapshot): BattleLaunchAction => ({
                    type: 'battle/launch',
                    battleSceneData: {
                        ...initData,
                        battleSnapshot,
                        battleData: {
                            cycle: {
                                launchTime: battleSnapshot.launchTime
                            },
                            current: {
                                teams: [],
                                players: [],
                                characters: []
                            },
                            future: {
                                teams: [],
                                players: [],
                                characters: []
                            }
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

            const { sendBattleLoadEnded } = await serviceNetwork({
                sendBattleLoadEnded: () => ({
                    type: 'battle-load-end'
                })
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
