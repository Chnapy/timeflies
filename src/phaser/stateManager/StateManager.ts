import { Position } from '../entities/Character';
import { BattleScene } from '../scenes/BattleScene';
import { Sort } from '../entities/Sort';

export type StateMap = {
    state: 'idle';
    data?: undefined;
} | {
    state: 'move';
    data: {
        currentTile: Phaser.Tilemaps.Tile;
        pathPositions: Position[];
    };
} | {
    state: 'watch';
    data?: undefined;
} | {
    state: 'sortPrepare';
    data: {
        sort: Sort;
    };
} | {
    state: 'sortLaunch';
    data: {
        sort: Sort;
        position: Position;
    };
};

export type State = StateMap['state'];

export type StateData<S extends State> = Extract<StateMap, {state: S}>['data'];

export abstract class StateManager<S extends State> {

    protected readonly scene: BattleScene;
    protected readonly stateData: StateData<S>;

    constructor(scene: BattleScene, stateData: StateData<S>) {
        this.scene = scene;
        this.stateData = stateData;
    }

    abstract init(): void;

    abstract onTileHover(pointer: Phaser.Input.Pointer): void;

    abstract onTileClick(pointer: Phaser.Input.Pointer): void;

    abstract update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void;

    abstract onTurnEnd(): void;
}