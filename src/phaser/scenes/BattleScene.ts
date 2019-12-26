import { IGameAction } from '../../action/GameAction';
import { Cycle, CycleStartTurn, CycleEndTurn } from '../cycle/Cycle';
import { Player, PlayerInfos, SpriteGenerator } from '../entities/Player';
import { MapComponent, MapInfos } from '../map/Map';
import { State as BattleState, StateManager as BattleStateManager, StateManager, State, StateMap } from '../stateManager/StateManager';
import { StateManagerIdle } from '../stateManager/StateManagerIdle';
import { StateManagerMoving } from '../stateManager/StateManagerMoving';
import { ConnectedScene } from './ConnectedScene';
import { StateManagerWatch } from '../stateManager/StateManagerWatch';
import { Character, Position } from '../entities/Character';
import { StateManagerSortPrepare } from '../stateManager/StateManagerSortPrepare';
import { Controller } from '../../Controller';

export interface BattleLaunchAction extends IGameAction<'battle/launch'> {
    data: BattleSceneData;
}

export interface BattleStateAction extends IGameAction<'battle/state'> {
    stateObject: StateMap;
}

export interface BattleCharacterPositionAction extends IGameAction<'battle/character/position'> {
    character: Character;
    position: Position;
}

export type BattleSceneAction =
    | BattleLaunchAction
    | BattleStateAction
    | BattleCharacterPositionAction;

export interface BattleSceneData {
    playersInfos: PlayerInfos[];
    mapInfos: MapInfos;
}

export class BattleScene extends ConnectedScene<'BattleScene', BattleSceneData> {

    players!: Player[];
    cycle!: Cycle;
    private graphics!: Phaser.GameObjects.Graphics;
    private state!: BattleState;
    battleStateManager!: BattleStateManager<any>;
    map!: MapComponent;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: BattleSceneData) {
        super.init(data);
    };

    preload = () => {
        // load the resources here
    };

    create(data: BattleSceneData) {
        const { playersInfos } = data;

        this.map = new MapComponent(this, data.mapInfos)
            .create();

        const spriteGenerator: SpriteGenerator = {
            tileToWorldPosition: this.map.tileToWorldPosition,
            spriteGenerate: (...args) => this.add.sprite(...args)
        };

        this.players = playersInfos.map(playerInfos => new Player(playerInfos, spriteGenerator));

        this.map.initPathfinder();

        this.cycle = new Cycle(this);

        this.graphics = this.add.graphics();

        const { decorLayer } = this.map;

        decorLayer
            .setInteractive()
            .on('pointermove', pointer => this.battleStateManager.onTileHover(pointer))
            .on('pointerup', pointer => this.battleStateManager.onTileClick(pointer));
    }

    update(time: number, delta: number): void {
        this.cycle.update(time);

        this.graphics.clear();

        this.battleStateManager.update(time, delta, this.graphics);
    }

    resetState(character: Character): void {
        this.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: character.isMine
                ? { state: 'idle' }
                : { state: 'watch' }
        });
    }

    private readonly onStateChange = this.reduce<BattleStateAction>('battle/state', action => {
        const { stateObject } = action;
        const { state } = stateObject;

        this.state = state;

        this.battleStateManager = getFromState(this);
        this.battleStateManager.init();

        function getFromState(scene: BattleScene): StateManager<any> {
            switch (stateObject.state) {
                case 'idle':
                    return new StateManagerIdle(scene, stateObject.data);
                case 'move':
                    return new StateManagerMoving(scene, stateObject.data);
                case 'watch':
                    return new StateManagerWatch(scene, stateObject.data);
                case 'sortPrepare':
                    return new StateManagerSortPrepare(scene, stateObject.data);
            }
        }
    });

    private readonly onTurnStart = this.reduce<CycleStartTurn>('turn/start', ({ character }) => {
        this.resetState(character);
    });

    private readonly onTurnEnd = this.reduce<CycleEndTurn>('turn/end', ({ character }) => {

        this.battleStateManager.onTurnEnd();

        this.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: { state: 'watch' }
        });

    });

    private readonly onCharacterPosition = this.reduce<BattleCharacterPositionAction>('battle/character/position',
        ({ character, position }) => {

            character.position = position;

            this.map.pathfinder.setGrid();

        });
}
