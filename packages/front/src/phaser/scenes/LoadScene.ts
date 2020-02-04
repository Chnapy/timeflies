import { BattleLoadEndedCAction } from '@shared/action/BattlePrepareAction';
import { BRunLaunchSAction } from '@shared/action/BattleRunAction';
import { BattleLoadPayload } from '@shared/BattleLoadPayload';
import { ReducerManager } from '../../ReducerManager';
import { IGameAction } from '../../action/GameAction';
import { AssetManager } from '../../assetManager/AssetManager';
import { Controller } from '../../Controller';
import { BattleLaunchAction } from '../battleReducers/BattleReducerManager';
import { Character } from '../entities/Character';
import { Spell } from '../entities/Spell';
import { BattleScene } from './BattleScene';
import { ConnectedScene } from './ConnectedScene';

export interface LoadLaunchAction extends IGameAction<'load/launch'> {
    payload: BattleLoadPayload;
}

export type LoadAction =
    | LoadLaunchAction;

export class LoadScene extends ConnectedScene<'LoadScene', BattleLoadPayload> {

    private reducerManager!: ReducerManager<LoadScene>;

    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        const payload = this.initData;
        const { mapInfos, characterTypes } = payload;
        const { urls } = mapInfos;

        // map tiles
        this.load.image('tiles', urls.sheet);

        // map in json format
        this.load.tilemapTiledJSON('map', urls.schema);

        characterTypes.forEach(type => {
            const { image, schema } = AssetManager.characters[ type ];

            this.load.atlasXML(Character.getSheetKey(type), image, schema);
        });

        this.load.atlasXML(Spell.getSheetKey(), AssetManager.spells.image, AssetManager.spells.schema);
    }

    create() {
        this.reducerManager = new class extends ReducerManager<LoadScene> {
            private readonly onLaunchAction = this.reduce<BattleLaunchAction>('battle/launch', ({
                battleSceneData
            }) => {
                this.scene.start<BattleScene>('BattleScene', battleSceneData);
            });
        }(this);

        Controller.client.send<BattleLoadEndedCAction>({
            type: 'battle-load-end'
        });

        Controller.client.on<BRunLaunchSAction>('battle-run/launch', ({
            battleSnapshot, globalTurnState
        }) => {

            Controller.dispatch<BattleLaunchAction>({
                type: 'battle/launch',
                battleSceneData: {
                    ...this.initData,
                    battleSnapshot,
                    battleData: {
                        launchTime: battleSnapshot.launchTime,
                        teams: [],
                        players: [],
                        characters: []
                    },
                    globalTurnState
                }
            });
        });

    }

    update(time: number, delta: number): void {
    }
}
