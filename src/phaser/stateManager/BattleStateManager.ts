import { Position } from '../entities/Character';
import { Sort } from '../entities/Sort';
import { BattleScene } from '../scenes/BattleScene';

export type BattleStateMap = {
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

export type BattleState = BattleStateMap['state'];

export type BattleStateData<S extends BattleState> = Extract<BattleStateMap, {state: S}>['data'];

export abstract class BattleStateManager<S extends BattleState> {

    protected readonly scene: BattleScene;
    protected readonly state: S;
    protected readonly stateData: BattleStateData<S>;

    constructor(state: S, scene: BattleScene, stateData: BattleStateData<S>) {
        this.state = state;
        this.scene = scene;
        this.stateData = stateData;
    }

    init(): void {
    }

    update(time: number, delta: number, graphics: Phaser.GameObjects.Graphics): void {
    }

    abstract onTileHover(pointer: Phaser.Input.Pointer): void;

    abstract onTileClick(pointer: Phaser.Input.Pointer): void;

    abstract onTurnEnd(): void;
}