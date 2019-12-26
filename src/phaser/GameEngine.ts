import { GameAction } from '../action/GameAction';
import { LoadScene } from './scenes/LoadScene';
import { BattleScene } from './scenes/BattleScene';
import { Controller } from '../Controller';
import { BootScene } from './scenes/BootScene';
import * as Colyseus from '../mocks/MockColyseus';

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

    readonly dispatch = <A extends GameAction>(action: A): void => {
        Controller.dispatch(action);
    }

    readonly emit = <A extends GameAction>(action: A): void => {
        this.game.scene.getScenes()
            .forEach(scene => scene.events.emit(action.type, action));
    }

    resize(width: number, height: number): void {
        this.game.scale.resize(width, height);
    }
}