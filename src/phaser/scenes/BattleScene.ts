import { AssetManager } from '../../assetManager/AssetManager';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { Room } from '../../mocks/MockColyseus';
import { Utils } from '../../Utils';
import { BattleReducerManager } from '../battleReducers/BattleReducerManager';
import { CameraManager } from '../camera/CameraManager';
import { CycleManager, Turn } from '../cycle/CycleManager';
import { Character, CharacterType, Orientation } from '../entities/Character';
import { Player } from '../entities/Player';
import { SpellType } from '../entities/Spell';
import { Team, TeamSnapshot } from '../entities/Team';
import { WithSnapshot } from '../entities/WithSnapshot';
import { MapInfos, MapManager } from '../map/MapManager';
import { BattleRoomManager, StartReceive } from '../room/BattleRoomManager';
import { SpellEngine } from '../spellEngine/SpellEngine';
import { ConnectedScene } from './ConnectedScene';

export interface BattleSceneData {
    room: Room<BattleRoomState>;
    battleData: BattleData;
}

export interface BattleSnapshot {
    teamsSnapshots: TeamSnapshot[];
}

export interface BattleRoomState {
    mapInfos: MapInfos;
    characterTypes: CharacterType[];
    spellTypes: SpellType[];
    battleSnapshot: BattleSnapshot;
}

export interface BattleData {
    readonly teams: Team[];
    readonly players: Player[];
    readonly characters: Character[];
    currentTurn?: Turn;
}

export class BattleScene extends ConnectedScene<'BattleScene', BattleSceneData> implements WithSnapshot<BattleSnapshot> {

    private room!: BattleRoomManager;
    private dataStateManager!: DataStateManager;
    private cameraManager!: CameraManager;

    private spellEngine!: SpellEngine;

    private graphics!: Phaser.GameObjects.Graphics;
    map!: MapManager;
    private cycle!: CycleManager;
    private reducerManager!: BattleReducerManager;

    battleData!: BattleData;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: BattleSceneData) {
        super.init(data);

        this.battleData = data.battleData;
    };

    preload = () => {
    };

    create(data: BattleSceneData) {

        this.room = new BattleRoomManager(data.room);

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

        this.spellEngine = new SpellEngine(this, this.battleData);

        this.cycle = new CycleManager(this.room, this.dataStateManager, this.battleData);

        this.graphics = this.add.graphics();

        this.battleData.characters.forEach(c => c.initHUD());

        const { decorLayer } = this.map;

        decorLayer
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
                if((pointer.event.target as any).localName !== 'canvas') {
                    return;
                }

                this.spellEngine.onTileHover(pointer);
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, (pointer: Phaser.Input.Pointer) => {
                if((pointer.event.target as any).localName !== 'canvas') {
                    return;
                }
                
                if (pointer.button === 0) {
                    this.spellEngine.onTileClick(pointer);
                }
            });

        this.cameraManager = new CameraManager(this);

        this.reducerManager = new BattleReducerManager(
            this,
            this.battleData,
            this.room,
            this.dataStateManager,
            this.cameraManager,
            this.spellEngine,
            this.graphics,
            this.map,
            this.cycle
        );

        this.reducerManager.onWatch({
            type: 'battle/watch'
        });

        BattleRoomManager.mockResponse<StartReceive>(2000, {
            type: 'start'
        });
    }

    update(time: number, delta: number): void {
        this.graphics.clear();

        this.cycle.update(time, delta);

        this.spellEngine.update(time, delta, this.graphics);

        this.cameraManager.update(time, delta);
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
