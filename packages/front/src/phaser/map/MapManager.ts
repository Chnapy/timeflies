import { Position } from '@timeflies/shared'
import { BattleScene } from '../scenes/BattleScene';
import { Pathfinder } from './Pathfinder';
import { MapInfos } from '@timeflies/shared'

export class MapManager {

    private readonly scene: BattleScene;
    private readonly mapInfos: MapInfos;

    readonly pathfinder: Pathfinder;

    tilemap!: Phaser.Tilemaps.Tilemap;
    decorLayer!: Phaser.Tilemaps.StaticTilemapLayer;
    obstaclesLayer!: Phaser.Tilemaps.StaticTilemapLayer;

    constructor(scene: BattleScene, mapInfos: MapInfos) {
        this.scene = scene;
        this.mapInfos = mapInfos;
        this.pathfinder = new Pathfinder(this, scene.battleData);
    }

    init(): void {
        const { tilemapKey, decorLayerKey, obstaclesLayerKey } = this.mapInfos;

        this.tilemap = this.scene.make.tilemap({ key: 'map' });

        const tiles = this.tilemap.addTilesetImage(tilemapKey, 'tiles');

        this.decorLayer = this.tilemap.createStaticLayer(decorLayerKey, tiles, 0, 0)
        this.obstaclesLayer = this.tilemap.createStaticLayer(obstaclesLayerKey, tiles, 0, 0)
            .setVisible(false);
    }

    initPathfinder(): void {
        this.pathfinder.setGrid();
    }

    tileToWorldPosition = (position: Position, center?: boolean): Position => {
        if (center) {
            position = {
                x: position.x + 0.5,
                y: position.y + 0.5,
            };
        }

        return this.tilemap.tileToWorldXY(position.x, position.y);
    };

    worldToTilePosition = (position: Position): Position => {
        return this.tilemap.worldToTileXY(position.x, position.y);
    };
}