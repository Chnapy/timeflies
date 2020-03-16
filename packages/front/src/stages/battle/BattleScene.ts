import { BattleSnapshot, CharacterType, GlobalTurnSnapshot, MapInfos, Orientation, SpellType } from '@timeflies/shared';
import { AssetManager } from '../../assetManager/AssetManager';
import { BattleData, BattleDataMap } from '../../BattleData';
import { DataStateManager } from '../../dataStateManager/DataStateManager';
import { BattleReducerManager } from '../../phaser/battleReducers/BattleReducerManager';
import { CameraManager } from './camera/CameraManager';
import { CharacterGraphic } from './graphics/CharacterGraphic';
import { Team } from './entities/Team';
import { WithSnapshot } from './entities/WithSnapshot';
import { MapManager } from '../../phaser/map/MapManager';
import { BattleRoomManager } from '../../phaser/room/BattleRoomManager';
import { SpellEngine } from '../../phaser/spellEngine/SpellEngine';
import { Utils } from '../../Utils';
import { ConnectedScene } from '../ConnectedScene';
import { BattleStage } from './BattleStage';
import { CycleManager } from './cycle/CycleManager';

export interface BattleSceneData {
    mapInfos: MapInfos;
    characterTypes: CharacterType[];
    spellTypes: SpellType[];
    battleSnapshot: BattleSnapshot;
    battleData: BattleDataMap;
    globalTurnState: GlobalTurnSnapshot;
}

export class BattleScene extends ConnectedScene<'BattleScene', BattleSceneData> implements WithSnapshot<BattleSnapshot> {

    private readonly battleStage: BattleStage;

    private room!: BattleRoomManager;
    private dataStateManager!: DataStateManager;
    private cameraManager!: CameraManager;

    private spellEngine!: SpellEngine;

    private graphics!: Phaser.GameObjects.Graphics;
    map!: MapManager;
    cycle!: CycleManager;
    private reducerManager!: BattleReducerManager;

    battleData!: BattleDataMap;

    constructor() {
        super({ key: 'BattleScene' });
        this.battleStage = BattleStage(this);
    }

    init(data: BattleSceneData) {
        super.init(data);
        this.battleStage.onInit();
        this.battleData = data.battleData;
    };

    preload = () => {
        this.battleStage.onPreload();
    };

    create(data: BattleSceneData) {

        this.battleStage.onCreate();

        this.room = new BattleRoomManager(this, data);

        this.dataStateManager = new DataStateManager(this, this.room.state.battleSnapshot);

        const { mapInfos, characterTypes, battleSnapshot } = this.room.state;
        const { teamsSnapshots } = battleSnapshot;

        this.createCharactersAnimations(characterTypes);

        this.map = new MapManager(this, mapInfos);
        this.map.init();

        this.battleData.teams.push(...teamsSnapshots.map(snap => new Team(snap)));
        this.battleData.players.push(...this.battleData.teams.flatMap(t => t.players));
        this.battleData.characters.push(...this.battleData.players.flatMap(p => p.characters));

        this.map.initPathfinder();

        this.battleData.characters.forEach(c => c.init());

        this.spellEngine = new SpellEngine(this, this.battleData);

        this.cycle = new CycleManager(this.room, this.dataStateManager, this.battleData);

        this.cycle.synchronizeGlobalTurn(data.globalTurnState);

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
    }

    update(time: number, delta: number): void {
        this.graphics.clear();

        this.cycle.update(time, delta);

        this.spellEngine.update(time, delta, this.graphics);

        this.cameraManager.update(time, delta);
    }

    getSnapshot(): BattleSnapshot {
        return {
            launchTime: this.battleData.launchTime,
            teamsSnapshots: this.battleData.teams.map(t => t.getSnapshot())
        };
    }

    updateFromSnapshot(snapshot: BattleSnapshot): void {
        snapshot.teamsSnapshots.forEach(tSnap => {
            const team = this.battleData.teams.find(t => t.id === tSnap.id);

            team!.updateFromSnapshot(tSnap);
        });
        this.map.pathfinder.refreshGrid();
    }

    private createCharactersAnimations(characterTypes: CharacterType[]): void {
        characterTypes.forEach((type: CharacterType) => {
            const { states } = AssetManager.characters[ type ];

            Utils.keysTyped(states).forEach(stateKey => {
                const state = states[ stateKey ];

                Utils.keysTyped(state).forEach((sideKey: Orientation) => {
                    const side = state[ sideKey ];

                    this.anims.create({
                        key: CharacterGraphic.getAnimKey(type, stateKey, sideKey),
                        frames: Array.isArray(side.frameNames)
                            ? side.frameNames
                            : this.anims.generateFrameNames(CharacterGraphic.getSheetKey(type), side.frameNames),
                        frameRate: side.frameRate,
                        repeat: side.frameRepeat
                    });
                });
            });
        });
    }
}
