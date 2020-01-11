import { IGameAction } from '../../action/GameAction';
import { AssetManager } from '../../assetManager/AssetManager';
import { Controller } from '../../Controller';
import { Room } from 'colyseus.js';
import { BattleLaunchAction } from '../battleReducers/BattleReducerManager';
import { Character } from '../entities/Character';
import { Spell } from '../entities/Spell';
import { BattleRoomState, BattleScene, BattleSceneData } from './BattleScene';
import { ConnectedScene } from './ConnectedScene';

export interface LoadLaunchAction extends IGameAction<'load/launch'> {
    room: Room<BattleRoomState>;
}

export type LoadAction =
    | LoadLaunchAction;

export class LoadScene extends ConnectedScene<'LoadScene', Room<BattleRoomState>> {

    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        const room = this.initData;
        const { mapInfos, characterTypes } = room.state;
        const { mapKey } = mapInfos;

        // map tiles
        this.load.image('tiles', AssetManager.maps[mapKey].image);

        // map in json format
        this.load.tilemapTiledJSON('map', AssetManager.maps[mapKey].schema);

        characterTypes.forEach(type => {
            const { image, schema } = AssetManager.characters[type];

            this.load.atlasXML(Character.getSheetKey(type), image, schema);
        });

        this.load.atlasXML(Spell.getSheetKey(), AssetManager.spells.image, AssetManager.spells.schema);
    }

    create() {
        const room = this.initData;

        const battleSceneData: BattleSceneData = {
            room,
            battleData: {
                teams: [],
                players: [],
                characters: []
            }
        }

        Controller.dispatch<BattleLaunchAction>({
            type: 'battle/launch',
            ...battleSceneData
        });

        this.start<BattleScene>('BattleScene', battleSceneData);
    }

    update(time: number, delta: number): void {
    }
}
