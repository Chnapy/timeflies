import { GameAction } from '../action/GameAction';
import { LoadScene } from './scenes/LoadScene';
import { BattleScene } from './scenes/BattleScene';
import { Controller } from '../Controller';
import { BootScene } from './scenes/BootScene';

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
        LoadScene,
        BattleScene
    ]
};

export class GameEngine {
    private readonly game: Phaser.Game;

    constructor(parent: HTMLElement) {
        this.game = new Phaser.Game({
            ...config,
            parent
        });
    }

    readonly dispatch = <A extends GameAction>(action: A): void => {
        Controller.dispatch(action);
    }

    readonly emit = <A extends GameAction>(action: A): void => {
        this.game.scene.getScenes()
            .forEach(scene => scene.events.emit(action.type, action));
    }
}