import { IGameAction } from '../../action/GameAction';
import { AssetManager, IAssetMap } from '../../assetManager/AssetManager';
import { Room } from '../../mocks/MockColyseus';
import { CameraManager } from '../camera/CameraManager';
import { CycleEndTurn, CycleManager, CycleStartTurn } from '../cycle/CycleManager';
import { Character, CharacterType, Position, CharacterState, Orientation } from '../entities/Character';
import { Player } from '../entities/Player';
import { TeamInfos } from '../entities/Team';
import { Team } from "../entities/Team";
import { MapInfos, MapManager as MapManager } from '../map/MapManager';
import { BattleRoomManager, StartReceive } from '../room/BattleRoomManager';
import { getFromState } from '../stateManager/getFromState';
import { State as BattleState, StateManager as BattleStateManager, StateMap } from '../stateManager/StateManager';
import { ConnectedScene } from './ConnectedScene';
import { Utils } from '../../Utils';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { WithInfos } from '../entities/WithInfos';

export interface BattleLaunchAction extends IGameAction<'battle/launch'> {
    data: BattleRoomState;
}

export interface BattleStateAction extends IGameAction<'battle/state'> {
    stateObject: StateMap;
}

export interface BattleCharacterPositionAction extends IGameAction<'battle/character/position'> {
    character: Character;
    position: Position;
    updateOrientation: boolean;
    updatePositionGraphic: boolean;
    updateOrientationGraphic: boolean;
    commit: boolean;
}

export type BattleSceneAction =
    | BattleLaunchAction
    | BattleStateAction
    | BattleCharacterPositionAction;

export interface BattleData {
    teamsInfos: TeamInfos[];
}

export interface BattleRoomState {
    mapInfos: MapInfos;
    characterTypes: CharacterType[];
    battleData: BattleData;
}

export class BattleScene extends ConnectedScene<'BattleScene', Room<BattleRoomState>> implements WithInfos<BattleData> {

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
    dataStateManager!: DataStateManager;

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

        this.dataStateManager = new DataStateManager(this);
        this.dataStateManager.init(this.room.state.battleData);

        const { mapInfos, characterTypes, battleData } = this.room.state;
        const { teamsInfos } = battleData;

        this.createCharactersAnimations(characterTypes);

        this.map = new MapManager(this, mapInfos)
            .init();

        this.teams = teamsInfos.map(infos => new Team(infos, this));

        this.players = this.teams.flatMap(t => t.players);

        this.characters = this.players.flatMap(p => p.characters);

        this.map.initPathfinder();

        this.characters.forEach(c => c.init());

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

        this.characters.forEach(c => c.update(time, delta, this.graphics));
    }

    resetState(character?: Character): void {
        this.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: character?.isMine
                ? { state: 'idle' }
                : { state: 'watch' }
        });
    }

    getInfos(): BattleData {
        return {
            teamsInfos: this.teams.map(t => t.getInfos())
        };
    }

    updateInfos(infos: BattleData): void {
        infos.teamsInfos.forEach(tInfos => {
            const team = this.teams.find(t => t.id === tInfos.id);

            team!.updateInfos(tInfos);
        });
        this.map.pathfinder.setGrid();
    }

    private createCharactersAnimations(characterTypes: CharacterType[]): void {
        characterTypes.forEach((type: CharacterType) => {
            const { states } = AssetManager.character[ type ];

            Utils.keysTyped(states).forEach(stateKey => {
                const state = states[ stateKey ];

                Utils.keysTyped(state).forEach((sideKey: Orientation) => {
                    const side = state[ sideKey ];

                    this.anims.create({
                        key: Character.getAnimKey(type, stateKey, sideKey),
                        frames: Array.isArray(side.frameNames)
                            ? side.frameNames
                            : this.anims.generateFrameNames(`${type}_sheet`, side.frameNames),
                        frameRate: side.frameRate,
                        repeat: side.frameRepeat
                    });
                });
            });
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

        this.dataStateManager.commit();

        this.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: { state: 'watch' }
        });
    });

    private readonly onCharacterPosition = this.reduce<BattleCharacterPositionAction>('battle/character/position',
        ({ character, position, updateOrientation,
            updatePositionGraphic, updateOrientationGraphic,
            commit }) => {

            character.setPosition(position, updatePositionGraphic, updateOrientation, updateOrientationGraphic);

            this.map.pathfinder.setGrid();

            if (commit) {
                this.dataStateManager.commit();
            }
        });
}
