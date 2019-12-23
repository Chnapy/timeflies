import { WorldSceneData } from './WorldScene';
import mapAsset from '../../_assets/map/map.png';
import mapJSONAsset from '../../_assets/map/map.sjson';

export class BootScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // map tiles
        this.load.image('tiles', mapAsset);

        // map in json format
        this.load.tilemapTiledJSON('map', mapJSONAsset);

        // our two characters
        // this.load.spritesheet('player', 'assets/RPG_assets.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {

        const data: WorldSceneData = {
            toto: 8
        };
        
        this.scene.start('WorldScene', data);
    }
}
