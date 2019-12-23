import { Pathfinder } from '../pathfinder/Pathfinder';
import { WorldScene } from '../scenes/WorldScene';

export class MapComponent {

    private readonly scene: WorldScene;

    readonly pathfinder: Pathfinder;

    tilemap!: Phaser.Tilemaps.Tilemap;
    decorLayer!: Phaser.Tilemaps.StaticTilemapLayer;
    obstaclesLayer!: Phaser.Tilemaps.StaticTilemapLayer;

    constructor(scene: WorldScene) {
        this.scene = scene;
        this.pathfinder = new Pathfinder(this);
    }

    create(): void {

        this.tilemap = this.scene.make.tilemap({ key: 'map' });

        const tiles = this.tilemap.addTilesetImage('map', 'tiles');

        this.decorLayer = this.tilemap.createStaticLayer('view', tiles, 0, 0)
        this.obstaclesLayer = this.tilemap.createStaticLayer('obstacles', tiles, 0, 0)
            .setVisible(false);

        this.pathfinder.setGrid();
    }
}