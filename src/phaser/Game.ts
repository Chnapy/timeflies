import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';

const config: Omit<Phaser.Types.Core.GameConfig, 'parent'> = {
    type: Phaser.AUTO,
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

export class Game {
    private readonly game: Phaser.Game;

    constructor(parent: HTMLElement) {
        this.game = new Phaser.Game({
            ...config,
            parent
        });
    }
}