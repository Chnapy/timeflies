import { IGameAction } from '../../action/GameAction';
import { IAssetMap } from '../../assetManager/AssetManager';
import { Room } from '../../mocks/MockColyseus';
import { CameraManager } from '../camera/CameraManager';
import { CycleEndTurn, CycleManager, CycleStartTurn } from '../cycle/CycleManager';
import { Character, CharacterType, Position } from '../entities/Character';
import { Player } from '../entities/Player';
import { Team, TeamInfos } from '../entities/Team';
import { MapInfos, MapManager as MapManager } from '../map/MapManager';
import { BattleRoomManager, StartReceive } from '../room/BattleRoomManager';
import { getFromState } from '../stateManager/getFromState';
import { State as BattleState, StateManager as BattleStateManager, StateMap } from '../stateManager/StateManager';
import { ConnectedScene } from './ConnectedScene';

export interface BattleLaunchAction extends IGameAction<'battle/launch'> {
    data: BattleRoomState;
}

export interface BattleStateAction extends IGameAction<'battle/state'> {
    stateObject: StateMap;
}

export interface BattleCharacterPositionAction extends IGameAction<'battle/character/position'> {
    character: Character;
    position: Position;
    updateGraphics: boolean;
}

export type BattleSceneAction =
    | BattleLaunchAction
    | BattleStateAction
    | BattleCharacterPositionAction;

export interface BattleRoomState {
    mapKey: keyof IAssetMap;
    characterTypes: CharacterType[];
    battleData: {
        teamsInfos: TeamInfos[];
        mapInfos: MapInfos;
    };
}

export class BattleScene extends ConnectedScene<'BattleScene', Room<BattleRoomState>> {

    private room!: BattleRoomManager;

    teams!: Team[];
    players!: Player[];
    characters!: Character[];

    cycle!: CycleManager;
    private graphics!: Phaser.GameObjects.Graphics;
    private state!: BattleState;
    battleStateManager!: BattleStateManager<any>;
    private cameraManager!: CameraManager;
    map!: MapManager;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: Room<BattleRoomState>) {
        super.init(data);
    };

    preload = () => {
    };

    create(data: Room<BattleRoomState>) {

        this.room = new BattleRoomManager(data, this);

        const { mapInfos, teamsInfos } = this.room.state.battleData;

        this.map = new MapManager(this, mapInfos)
            .init();

        this.teams = teamsInfos.map(infos => new Team(infos, this));

        this.players = this.teams.flatMap(t => t.players);

        this.characters = this.players.flatMap(p => p.characters);

        this.map.initPathfinder();

        this.onStateChange({
            type: 'battle/state',
            stateObject: { state: 'watch' }
        });

        this.cycle = new CycleManager(this, this.room);

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

        this.cameraManager = new CameraManager(this);

        BattleRoomManager.mockResponse<StartReceive>(2000, {
            type: 'start'
        });
    }

    update(time: number, delta: number): void {
        this.graphics.clear();

        this.cycle.update(time, delta);

        this.battleStateManager.update(time, delta, this.graphics);

        this.cameraManager.update(time, delta);
    }

    resetState(character?: Character): void {
        this.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: character?.isMine
                ? { state: 'idle' }
                : { state: 'watch' }
        });
    }

    private readonly onStateChange = this.reduce<BattleStateAction>('battle/state', action => {
        const { stateObject } = action;

        this.state = stateObject.state;

        this.battleStateManager = getFromState(this, stateObject)
            .init();
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
        ({ character, position, updateGraphics }) => {

            character.position = position;

            this.map.pathfinder.setGrid();

            if (updateGraphics) {
                const { position, graphicContainer } = character;

                const worldPosition = this.map.tileToWorldPosition(position, true);
                graphicContainer.setPosition(worldPosition.x, worldPosition.y);
            }
        });
}
