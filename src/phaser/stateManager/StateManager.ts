import { Position } from '../entities/Character';
import { BattleScene } from '../scenes/BattleScene';
import { Sort } from '../entities/Sort';
import { GameManager } from '../GameManager';

export type StateMap = {
    state: 'idle';
    data?: undefined;
} | {
    state: 'move';
    data: {
        currentTile: Phaser.Tilemaps.Tile;
        pathTile: Position[];
        pathWorld: Position[];
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

export abstract class StateManager<S extends State> extends GameManager {

    protected readonly stateData: StateData<S>;

    constructor(scene: BattleScene, stateData: StateData<S>) {
        super(scene);
        this.stateData = stateData;
    }

    abstract onTileHover(pointer: Phaser.Input.Pointer): void;

    abstract onTileClick(pointer: Phaser.Input.Pointer): void;

    abstract onTurnEnd(): void;
}