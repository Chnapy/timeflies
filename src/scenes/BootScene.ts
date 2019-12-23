import { WorldSceneData } from './WorldScene';

export class BootScene extends Phaser.Scene {

    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // map tiles
        this.load.image('tiles', 'assets/tiled/map.png');

        // map in json format
        this.load.tilemapTiledJSON('map', 'assets/tiled/map.json');

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
