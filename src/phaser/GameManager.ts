import { BattleScene } from './scenes/BattleScene';

export abstract class GameManager {

    protected readonly scene: BattleScene;

    constructor(scene: BattleScene) {
        this.scene = scene;
    }

    init(): this {
        return this;
    }

    update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void {
    }
}