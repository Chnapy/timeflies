import { BattleScene } from '../scenes/BattleScene';

export type State = 'idle' | 'moving';

export abstract class StateManager {

    protected readonly scene: BattleScene;

    constructor(scene: BattleScene) {
        this.scene = scene;
    }

    abstract onTileHover(pointer: Phaser.Input.Pointer): void;

    abstract onTileClick(): void;

    abstract update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void;
}