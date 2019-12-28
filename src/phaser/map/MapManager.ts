import { Pathfinder } from './Pathfinder';
import { BattleScene } from '../scenes/BattleScene';
import { Position } from '../entities/Character';
import { GameManager } from '../GameManager';
import { IAssetMap } from '../../assetManager/AssetManager';

export interface MapInfos {
    mapKey: keyof IAssetMap;
    tilemapKey: string;
    decorLayerKey: string;
    obstaclesLayerKey: string;
}

export class MapManager extends GameManager {

    private readonly mapInfos: MapInfos;

    readonly pathfinder: Pathfinder;

    tilemap!: Phaser.Tilemaps.Tilemap;
    decorLayer!: Phaser.Tilemaps.StaticTilemapLayer;
    obstaclesLayer!: Phaser.Tilemaps.StaticTilemapLayer;

    constructor(scene: BattleScene, mapInfos: MapInfos) {
        super(scene);
        this.mapInfos = mapInfos;
        this.pathfinder = new Pathfinder(this, scene);
    }

    init(): this {
        const { tilemapKey, decorLayerKey, obstaclesLayerKey } = this.mapInfos;

        this.tilemap = this.scene.make.tilemap({ key: 'map' });

        const tiles = this.tilemap.addTilesetImage(tilemapKey, 'tiles');

        this.decorLayer = this.tilemap.createStaticLayer(decorLayerKey, tiles, 0, 0)
        this.obstaclesLayer = this.tilemap.createStaticLayer(obstaclesLayerKey, tiles, 0, 0)
            .setVisible(false);

        return this;
    }

    initPathfinder(): this {
        this.pathfinder.setGrid();

        return this;
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