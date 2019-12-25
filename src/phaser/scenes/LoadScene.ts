import { AssetManager, IAssetMap, IAssetCharacter } from '../../assetManager/AssetManager';
import { BattleLaunchAction, BattleScene, BattleSceneData } from './BattleScene';
import { ConnectedScene } from './ConnectedScene';
import { CharacterType } from '../entities/Character';

export interface LoadSceneData {
    mapKey: keyof IAssetMap;
    characterTypes: CharacterType[];
    battleData: BattleSceneData;
}

export class LoadScene extends ConnectedScene<'LoadScene', LoadSceneData> {

    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        const { mapKey, characterTypes } = this.initData;

        // map tiles
        this.load.image('tiles', AssetManager.map[ mapKey ].image);

        // map in json format
        this.load.tilemapTiledJSON('map', AssetManager.map[ mapKey ].schema);

        // characters
        characterTypes.forEach(type => this.load.spritesheet(
            type,
            AssetManager.character[ type ].idle,
            { frameWidth: 35, frameHeight: 35 }
        ));
    }

    create() {
        const { battleData } = this.initData;

        this.onBattleLaunch({
            type: 'battle/launch',
            data: battleData
        });
    }

    update(time: number, delta: number): void {
    }

    private readonly onBattleLaunch = this.reduce<BattleLaunchAction>('battle/launch', action => {
        this.start<BattleScene>('BattleScene', action.data);
    });
}
