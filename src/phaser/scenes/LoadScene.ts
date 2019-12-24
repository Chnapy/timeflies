import { AssetManager, IAssetMap } from '../../assetManager/AssetManager';
import { BattleLaunchAction, BattleScene, BattleSceneData } from './BattleScene';
import { ConnectedScene } from './ConnectedScene';

export interface LoadSceneData {
    mapKey: keyof IAssetMap;
    battleData: BattleSceneData;
}

export class LoadScene extends ConnectedScene<'LoadScene', LoadSceneData> {

    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        const { mapKey } = this.initData;
        console.log(mapKey, AssetManager)

        // map tiles
        this.load.image('tiles', AssetManager.map[ mapKey ].image);

        // map in json format
        this.load.tilemapTiledJSON('map', AssetManager.map[ mapKey ].schema);

        // our two characters
        // this.load.spritesheet('player', 'assets/RPG_assets.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        const { battleData } = this.initData;

        this.onBattleLaunch({
            type: 'battle/launch',
            data: battleData
        })
    }

    update(time: number, delta: number): void {
    }

    private readonly onBattleLaunch = this.reduce<BattleLaunchAction>('battle/launch', action => {
        this.start<BattleScene>('BattleScene', action.data);
    });
}
