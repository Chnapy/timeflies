import { Room } from '../../mocks/MockColyseus';
import { AssetManager } from '../../assetManager/AssetManager';
import { BattleRoomState, BattleScene } from './BattleScene';
import { ConnectedScene } from './ConnectedScene';

export class LoadScene extends ConnectedScene<'LoadScene', Room<BattleRoomState>> {

    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        const room = this.initData;
        const { mapKey, characterTypes } = room.state;

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
        const room = this.initData;
        // const { battleData } = room.state;

        this.start<BattleScene>('BattleScene', room);

        // this.onBattleLaunch({
        //     type: 'battle/launch',
        //     data: battleData
        // });
    }

    update(time: number, delta: number): void {
    }

    // private readonly onBattleLaunch = this.reduce<BattleLaunchAction>('battle/launch', action => {
    //     this.start<BattleScene>('BattleScene', action.data);
    // });
}
