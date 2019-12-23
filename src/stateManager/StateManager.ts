import { WorldScene } from '../scenes/WorldScene';

export type State = 'idle' | 'moving';

export abstract class StateManager {

    protected readonly scene: WorldScene;
    protected readonly setState: (state: State) => void;

    constructor(scene: WorldScene, setState: (state: State) => void) {
        this.scene = scene;
        this.setState = setState;
    }

    abstract onTileHover(pointer: Phaser.Input.Pointer): void;

    abstract onTileClick(pointer: Phaser.Input.Pointer): void;

    abstract update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void;
}