import { Player } from '../entities/Player';
import { Character } from '../entities/Character';
import { Cycle } from '../cycle/Cycle';
import { MapComponent } from '../map/Map';
import { StateManager, State } from '../stateManager/StateManager';
import { StateManagerIdle } from '../stateManager/StateManagerIdle';
import { StateManagerMoving } from '../stateManager/StateManagerMoving';

export interface WorldSceneData {

}

export class WorldScene extends Phaser.Scene {
    private player!: Player;
    cycle!: Cycle;
    private graphics!: Phaser.GameObjects.Graphics;
    private state!: State;
    stateManager!: StateManager;
    readonly map: MapComponent;

    constructor() {
        super({ key: 'WorldScene' });
        this.map = new MapComponent(this);
    }

    init: Phaser.Types.Scenes.SceneInitCallback = (data: WorldSceneData) => {
        console.log(data);
    };

    preload: Phaser.Types.Scenes.ScenePreloadCallback = () => {
        // load the resources here
    };

    create: Phaser.Types.Scenes.SceneCreateCallback = () => {
        this.map.create();

        this.setState('idle');

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
            .on('pointermove', (pointer: Phaser.Input.Pointer) => {
                this.stateManager.onTileHover(pointer);
            })
            .on('pointerup', (pointer: Phaser.Input.Pointer) => {
                this.stateManager.onTileClick(pointer);
            });
    };

    update(time: number, delta: number): void {
        this.cycle.update(time);

        this.graphics.clear();

        this.stateManager.update(time, delta, this.graphics);
    }

    private readonly setState = (state: State): void => {
        if (state === this.state) {
            return;
        }

        this.state = state;

        switch (state) {
            case 'idle':
                this.stateManager = new StateManagerIdle(this, this.setState);
                return;
            case 'moving':
                this.stateManager = new StateManagerMoving(this, this.setState);
                return;
        }
    };
}