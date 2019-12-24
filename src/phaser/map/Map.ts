import { Pathfinder } from '../pathfinder/Pathfinder';
import { BattleScene } from '../scenes/BattleScene';

export interface MapInfos {
    tilemapKey: string;
    decorLayerKey: string;
    obstaclesLayerKey: string;
}

export class MapComponent {

    private readonly scene: BattleScene;
    private readonly mapInfos: MapInfos;

    readonly pathfinder: Pathfinder;

    tilemap!: Phaser.Tilemaps.Tilemap;
    decorLayer!: Phaser.Tilemaps.StaticTilemapLayer;
    obstaclesLayer!: Phaser.Tilemaps.StaticTilemapLayer;

    constructor(scene: BattleScene, mapInfos: MapInfos) {
        this.scene = scene;
        this.mapInfos = mapInfos;
        this.pathfinder = new Pathfinder(this);
    }

    create(): this {
        const { tilemapKey, decorLayerKey, obstaclesLayerKey } = this.mapInfos;

        this.tilemap = this.scene.make.tilemap({ key: 'map' });

        const tiles = this.tilemap.addTilesetImage(tilemapKey, 'tiles');

        this.decorLayer = this.tilemap.createStaticLayer(decorLayerKey, tiles, 0, 0)
        this.obstaclesLayer = this.tilemap.createStaticLayer(obstaclesLayerKey, tiles, 0, 0)
            .setVisible(false);

        this.pathfinder.setGrid();

        return this;
    }
}