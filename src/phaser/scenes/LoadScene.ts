import { AssetManager } from '../../assetManager/AssetManager';
import { Room } from '../../mocks/MockColyseus';
import { Character } from '../entities/Character';
import { BattleRoomState, BattleScene } from './BattleScene';
import { ConnectedScene } from './ConnectedScene';
import { Spell } from '../entities/Spell';

export class LoadScene extends ConnectedScene<'LoadScene', Room<BattleRoomState>> {

    constructor() {
        super({ key: 'LoadScene' });
    }

    preload() {
        const room = this.initData;
        const { mapInfos, characterTypes } = room.state;
        const { mapKey } = mapInfos;

        // map tiles
        this.load.image('tiles', AssetManager.maps[ mapKey ].image);

        // map in json format
        this.load.tilemapTiledJSON('map', AssetManager.maps[ mapKey ].schema);

        characterTypes.forEach(type => {
            const { image, schema } = AssetManager.characters[ type ];

            this.load.atlasXML(Character.getSheetKey(type), image, schema);
        });

        this.load.atlasXML(Spell.getSheetKey(), AssetManager.spells.image, AssetManager.spells.schema);
    }

    create() {
        const room = this.initData;

        this.start<BattleScene>('BattleScene', room);
    }

    update(time: number, delta: number): void {
    }
}
