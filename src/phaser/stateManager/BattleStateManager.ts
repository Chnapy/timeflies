import { Position } from '../entities/Character';
import { Spell } from '../entities/Spell';
import { BattleScene, BattleData } from '../scenes/BattleScene';

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
    state: 'spellPrepare';
    data: {
        spell: Spell;
    };
} | {
    state: 'spellLaunch';
    data: {
        spell: Spell;
        position: Position;
    };
};

export type BattleState = BattleStateMap['state'];

export type BattleStateData<S extends BattleState> = Extract<BattleStateMap, {state: S}>['data'];

export abstract class BattleStateManager<S extends BattleState> {

    protected readonly scene: BattleScene;
    protected readonly battleData: BattleData;
    protected readonly stateData: BattleStateData<S>;

    constructor(scene: BattleScene, battleData: BattleData, stateData: BattleStateData<S>) {
        this.scene = scene;
        this.battleData = battleData;
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