import { IGameAction } from '../../action/GameAction';
import { IAssetMap } from '../../assetManager/AssetManager';
import { Room } from '../../mocks/MockColyseus';
import { Cycle, CycleEndTurn, CycleStartTurn } from '../cycle/Cycle';
import { Character, CharacterType, Position } from '../entities/Character';
import { Player } from '../entities/Player';
import { Team, TeamInfos } from '../entities/Team';
import { MapComponent, MapInfos } from '../map/Map';
import { State as BattleState, StateManager as BattleStateManager, StateManager, StateMap } from '../stateManager/StateManager';
import { StateManagerIdle } from '../stateManager/StateManagerIdle';
import { StateManagerMoving } from '../stateManager/StateManagerMoving';
import { StateManagerSortLaunch } from '../stateManager/StateManagerSortLaunch';
import { StateManagerSortPrepare } from '../stateManager/StateManagerSortPrepare';
import { StateManagerWatch } from '../stateManager/StateManagerWatch';
import { ConnectedScene } from './ConnectedScene';
import { BattleRoom, BattleStartMessage } from '../room/BattleRoom';

export interface BattleLaunchAction extends IGameAction<'battle/launch'> {
    data: BattleRoomState;
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

// export interface BattleStartMessage

export interface BattleRoomState {
    mapKey: keyof IAssetMap;
    characterTypes: CharacterType[];
    battleData: {
        teamsInfos: TeamInfos[];
        mapInfos: MapInfos;
    };
}

export class BattleScene extends ConnectedScene<'BattleScene', Room<BattleRoomState>> {

    private room!: BattleRoom;

    teams!: Team[];
    players!: Player[];
    characters!: Character[];

    cycle!: Cycle;
    private graphics!: Phaser.GameObjects.Graphics;
    private state!: BattleState;
    battleStateManager!: BattleStateManager<any>;
    map!: MapComponent;

    private origDragPoint?: Position;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: Room<BattleRoomState>) {
        super.init(data);
    };

    preload = () => {
        // load the resources here
    };

    create(data: Room<BattleRoomState>) {

        this.room = new BattleRoom(data, this);

        const { mapInfos, teamsInfos } = this.room.state.battleData;

        this.map = new MapComponent(this, mapInfos)
            .create();

        this.teams = teamsInfos.map(infos => new Team(infos, this));

        this.players = this.teams.flatMap(t => t.players);

        this.characters = this.players.flatMap(p => p.characters);

        this.map.initPathfinder();

        this.onStateChange({
            type: 'battle/state',
            stateObject: { state: 'watch' }
        });

        this.cycle = new Cycle(this);

        this.graphics = this.add.graphics();

        const { decorLayer } = this.map;

        decorLayer
            .setInteractive()
            .on('pointermove', (pointer: Phaser.Input.Pointer) => this.battleStateManager.onTileHover(pointer))
            .on('pointerup', (pointer: Phaser.Input.Pointer) => {
                if (pointer.button === 0) {
                    this.battleStateManager.onTileClick(pointer);
                }
            });

            this.room.mockResponse<BattleStartMessage>(2000, {
                type: 'start'
            });
    }

    update(time: number, delta: number): void {
        this.graphics.clear();

        this.cycle.update(time, delta);

        this.battleStateManager.update(time, delta, this.graphics);

        if (this.game.input.activePointer.isDown && this.game.input.activePointer.button === 1) {
            if (this.origDragPoint) {
                // move the camera by the amount the mouse has moved since last update		
                this.cameras.main.scrollX += this.origDragPoint.x - this.game.input.activePointer.position.x;
                this.cameras.main.scrollY += this.origDragPoint.y - this.game.input.activePointer.position.y;
            }
            // set new drag origin to current position	
            this.origDragPoint = this.game.input.activePointer.position.clone();
        }
        else if (this.origDragPoint) {
            delete this.origDragPoint;
        }

    }

    resetState(character?: Character): void {
        this.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: character?.isMine
                ? { state: 'idle' }
                : { state: 'watch' }
        });
    }

    private readonly onRoomMessage = (message): void => {
        console.log('message', message);
    };

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
                case 'sortLaunch':
                    return new StateManagerSortLaunch(scene, stateObject.data);
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
