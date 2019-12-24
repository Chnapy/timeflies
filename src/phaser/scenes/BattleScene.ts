import { Cycle } from '../cycle/Cycle';
import { Character } from '../entities/Character';
import { Player } from '../entities/Player';
import { MapComponent, MapInfos } from '../map/Map';
import { State as BattleState, StateManager as BattleStateManager } from '../stateManager/StateManager';
import { StateManagerIdle } from '../stateManager/StateManagerIdle';
import { StateManagerMoving } from '../stateManager/StateManagerMoving';
import { ConnectedScene } from './ConnectedScene';
import { Action } from 'redux';

export interface BattleLaunchAction extends Action<'battle/launch'> {
    data: BattleSceneData;
}

export interface MoveAction extends Action<'move'> {
    pointer: Phaser.Input.Pointer;
}

export interface BattleStateAction extends Action<'battle/state'> {
    state: BattleState;
}

export interface BattleSceneData {
    players: Player[];
    mapInfos: MapInfos;
}

export class BattleScene extends ConnectedScene<'BattleScene', BattleSceneData> {

    private player!: Player;
    cycle!: Cycle;
    private graphics!: Phaser.GameObjects.Graphics;
    private state!: BattleState;
    battleStateManager!: BattleStateManager;
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
        this.map = new MapComponent(this, data.mapInfos)
            .create();

        this.onStateChange({
            type: 'battle/state',
            state: "idle"
        });

        const { tileWidth, tileHeight } = this.map.tilemap;

        const mainPos = { x: 4, y: 3 };

        const mainCharacter = new Character(
            'Char1',
            this.add.sprite(mainPos.x * tileWidth + tileWidth / 2, mainPos.y * tileHeight + tileHeight / 2, 'player', 0),
            mainPos,
            100,
            4000
        );

        this.player = new Player(
            'J1',
            [
                mainCharacter
            ]
        );

        this.cycle = new Cycle(
            this.player.characters
        );

        this.graphics = this.add.graphics();

        const { decorLayer } = this.map;

        decorLayer
            .setInteractive()
            .on('pointermove', pointer => this.battleStateManager.onTileHover(pointer))
            .on('pointerup', (pointer: Phaser.Input.Pointer) => {
                this.dispatch<MoveAction>({
                    type: 'move',
                    pointer
                });
            });
    }

    update(time: number, delta: number): void {
        this.cycle.update(time);

        this.graphics.clear();

        this.battleStateManager.update(time, delta, this.graphics);
    }

    private readonly onTileClick = this.reduce<MoveAction>('move', action => this.battleStateManager.onTileClick());

    private readonly onStateChange = this.reduce<BattleStateAction>('battle/state', action => {
        const { state } = action;
console.log('change state', state);
        if (state === this.state) {
            return;
        }

        this.state = state;

        switch (state) {
            case 'idle':
                this.battleStateManager = new StateManagerIdle(this);
                return;
            case 'moving':
                this.battleStateManager = new StateManagerMoving(this);
                return;
        }
    });
}
