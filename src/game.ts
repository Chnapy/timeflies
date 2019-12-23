import 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 640,
    height: 480,
    zoom: 1,
    render: {
        pixelArt: true
    },
    scene: [
        BootScene,
        WorldScene
    ]
};

const game = new Phaser.Game(config);
