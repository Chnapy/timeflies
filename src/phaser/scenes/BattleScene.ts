import { AssetManager } from '../../assetManager/AssetManager';
import { Controller } from '../../Controller';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { Room } from '../../mocks/MockColyseus';
import { Utils } from '../../Utils';
import { BattleReducerManager, BattleStateAction } from '../battleReducers/BattleReducerManager';
import { CameraManager } from '../camera/CameraManager';
import { CycleManager } from '../cycle/CycleManager';
import { Character, CharacterType, Orientation } from '../entities/Character';
import { Player } from '../entities/Player';
import { Team, TeamInfos } from '../entities/Team';
import { WithInfos } from '../entities/WithInfos';
import { MapInfos, MapManager as MapManager } from '../map/MapManager';
import { BattleRoomManager, StartReceive } from '../room/BattleRoomManager';
import { BattleStateManager } from '../stateManager/BattleStateManager';
import { ConnectedScene } from './ConnectedScene';

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
    private dataStateManager!: DataStateManager;
    private cameraManager!: CameraManager;
    private battleStateManager!: BattleStateManager<any>;
    private graphics!: Phaser.GameObjects.Graphics;
    map!: MapManager;
    private cycle!: CycleManager;
    private reducerManager!: BattleReducerManager;

    readonly teams: Team[];
    readonly players: Player[];
    readonly characters: Character[];

    constructor() {
        super({ key: 'BattleScene' });
        this.teams = [];
        this.players = [];
        this.characters = [];
    }

    init(data: Room<BattleRoomState>) {
        super.init(data);
    };

    preload = () => {
    };

    create(data: Room<BattleRoomState>) {

        this.room = new BattleRoomManager(data);

        this.dataStateManager = new DataStateManager(this, this.room.state.battleData);

        const { mapInfos, characterTypes, battleData } = this.room.state;
        const { teamsInfos } = battleData;

        this.createCharactersAnimations(characterTypes);

        this.map = new MapManager(this, mapInfos);
        this.map.init();

        this.teams.push(...teamsInfos.map(infos => new Team(infos, this)));

        this.players.push(...this.teams.flatMap(t => t.players));

        this.characters.push(...this.players.flatMap(p => p.characters));

        this.map.initPathfinder();

        this.characters.forEach(c => c.init());

        this.cycle = new CycleManager(this.room, this.dataStateManager, this.players, this.characters);

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

        this.reducerManager = new BattleReducerManager(
            this,
            this.room,
            this.dataStateManager,
            this.cameraManager,
            () => this.battleStateManager,
            battleStateManager => this.battleStateManager = battleStateManager,
            this.graphics,
            this.map,
            this.cycle
        );
        this.reducerManager.init();

        this.reducerManager.onStateChange({
            type: 'battle/state',
            stateObject: { state: 'watch' }
        });

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
        Controller.dispatch<BattleStateAction>({
            type: 'battle/state',
            stateObject: character?.isMine
                ? { state: 'idle' }
                : { state: 'watch' }
        });
    }

    getCurrentCharacter(): Character {
        return this.cycle.getCurrentCharacter();
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
                            : this.anims.generateFrameNames(Character.getSheetKey(type), side.frameNames),
                        frameRate: side.frameRate,
                        repeat: side.frameRepeat
                    });
                });
            });
        });
    }
}
