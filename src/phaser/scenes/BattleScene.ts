import { AssetManager } from '../../assetManager/AssetManager';
import { Controller } from '../../Controller';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { HUDScene } from '../../hud/HUDScene';
import { Room } from '../../mocks/MockColyseus';
import { Utils } from '../../Utils';
import { BattleReducerManager, BattleStateAction } from '../battleReducers/BattleReducerManager';
import { CameraManager } from '../camera/CameraManager';
import { CharAction, CycleManager } from '../cycle/CycleManager';
import { Character, CharacterType, Orientation } from '../entities/Character';
import { Player } from '../entities/Player';
import { SpellType } from '../entities/Spell';
import { Team, TeamSnapshot } from '../entities/Team';
import { WithSnapshot } from '../entities/WithSnapshot';
import { MapInfos, MapManager as MapManager } from '../map/MapManager';
import { BattleRoomManager, StartReceive } from '../room/BattleRoomManager';
import { BattleState, BattleStateManager, BattleStateMap } from '../stateManager/BattleStateManager';
import { ConnectedScene } from './ConnectedScene';

export interface BattleSnapshot {
    teamsSnapshots: TeamSnapshot[];
}

export interface BattleRoomState {
    mapInfos: MapInfos;
    characterTypes: CharacterType[];
    spellTypes: SpellType[];
    battleSnapshot: BattleSnapshot;
}

export interface BattleData<S extends BattleState = BattleState> {
    readonly teams: Team[];
    readonly players: Player[];
    readonly characters: Character[];
    currentCharacter?: Character;
    battleState: BattleStateMap;
    readonly charActionStack: CharAction[];
}

export class BattleScene extends ConnectedScene<'BattleScene', Room<BattleRoomState>> implements WithSnapshot<BattleSnapshot> {

    private room!: BattleRoomManager;
    private dataStateManager!: DataStateManager;
    private cameraManager!: CameraManager;
    private battleStateManager!: BattleStateManager<any>;
    private graphics!: Phaser.GameObjects.Graphics;
    map!: MapManager;
    private cycle!: CycleManager;
    private reducerManager!: BattleReducerManager;

    readonly battleData: BattleData;

    constructor() {
        super({ key: 'BattleScene' });
        this.battleData = {
            teams: [],
            players: [],
            characters: [],
            battleState: {
                state: 'watch'
            },
            charActionStack: []
        };
    }

    init(data: Room<BattleRoomState>) {
        super.init(data);

        this.addScene<HUDScene>('HUDScene', HUDScene);

        this.launch<HUDScene>('HUDScene', {
            battleData: this.battleData
        });
    };

    preload = () => {
    };

    create(data: Room<BattleRoomState>) {

        this.room = new BattleRoomManager(data);

        this.dataStateManager = new DataStateManager(this, this.room.state.battleSnapshot);

        const { mapInfos, characterTypes, battleSnapshot } = this.room.state;
        const { teamsSnapshots } = battleSnapshot;

        this.createCharactersAnimations(characterTypes);

        this.map = new MapManager(this, mapInfos);
        this.map.init();

        this.battleData.teams.push(...teamsSnapshots.map(snap => new Team(snap, this)));
        this.battleData.players.push(...this.battleData.teams.flatMap(t => t.players));
        this.battleData.characters.push(...this.battleData.players.flatMap(p => p.characters));

        this.map.initPathfinder();

        this.battleData.characters.forEach(c => c.init());

        this.cycle = new CycleManager(this.room, this.dataStateManager, this.battleData);

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
            this.battleData,
            this.room,
            this.dataStateManager,
            this.cameraManager,
            () => this.battleStateManager,
            battleStateManager => this.battleStateManager = battleStateManager,
            this.graphics,
            this.map,
            this.cycle
        );

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

    getSnapshot(): BattleSnapshot {
        return {
            teamsSnapshots: this.battleData.teams.map(t => t.getSnapshot())
        };
    }

    updateFromSnapshot(snapshot: BattleSnapshot): void {
        snapshot.teamsSnapshots.forEach(tSnap => {
            const team = this.battleData.teams.find(t => t.id === tSnap.id);

            team!.updateFromSnapshot(tSnap);
        });
        this.map.pathfinder.setGrid();
    }

    private createCharactersAnimations(characterTypes: CharacterType[]): void {
        characterTypes.forEach((type: CharacterType) => {
            const { states } = AssetManager.characters[ type ];

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
