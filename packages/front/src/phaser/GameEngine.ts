import { GameAction } from '../action/GameAction';
import { BattleScene } from '../stages/battle/BattleScene';
import { BootScene } from '../stages/boot/BootScene';
import { LoadScene } from '../stages/load/LoadScene';

const config: Omit<Phaser.Types.Core.GameConfig, 'parent' | 'width' | 'height'> = {
    type: Phaser.AUTO,
    zoom: 1,
    render: {
        pixelArt: true
    },
    scene: [
        BootScene,
        LoadScene,
        BattleScene
    ]
};

export class GameEngine {
    private readonly game: Phaser.Game;

    constructor(parent: HTMLElement) {
        this.game = new Phaser.Game({
            ...config,
            parent,
            width: parent.clientWidth,
            height: parent.clientHeight
        });
    }

    readonly emit = <A extends GameAction>(action: A): void => {
        this.game.scene.getScenes()
            .forEach(scene => scene.events.emit(action.type, action));
    }

    forEachScene = (fn: (scene: Phaser.Scene) => void): void => {
        this.game.scene.getScenes()
            .forEach(fn);
    }

    resize(width: number, height: number): void {
        if (this.game.canvas)
            this.game.scale.resize(width, height);
    }
}