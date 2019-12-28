import { AssetManager } from '../../assetManager/AssetManager';
import { Room } from '../../mocks/MockColyseus';
import { BattleRoomState, BattleScene } from './BattleScene';
import { ConnectedScene } from './ConnectedScene';

export class LoadScene extends ConnectedScene<'LoadScene', Room<BattleRoomState>> {

    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        const room = this.initData;
        const { mapInfos, characterTypes } = room.state;
        const { mapKey } = mapInfos;

        // map tiles
        this.load.image('tiles', AssetManager.map[ mapKey ].image);

        // map in json format
        this.load.tilemapTiledJSON('map', AssetManager.map[ mapKey ].schema);

        characterTypes.forEach(type => {
            const { image, schema } = AssetManager.character[ type ];

            this.load.atlasXML(type + '_sheet', image, schema);
        });
    }

    create() {
        const room = this.initData;

        this.start<BattleScene>('BattleScene', room);
    }

    update(time: number, delta: number): void {
    }
}
