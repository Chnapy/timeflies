import { MapInfos, Position } from "@timeflies/shared";

export interface MapGraphics extends Readonly<{
    tilemap: Readonly<{
        width: number;
        height: number;
    }>;
    hasObstacleAt(position: Position): boolean;
    tileToWorld(position: Position, center?: boolean): Position;
    worldToTile(position: Position): Position;
}> { }

export interface MapGraphicsDeps {
    scene: { make: Pick<Phaser.Scene[ 'make' ], 'tilemap'> };
}

export type MapInfosGraphics = Pick<MapInfos, 'tilemapKey' | 'decorLayerKey' | 'obstaclesLayerKey'>;

export const MapGraphics = (
    { tilemapKey, decorLayerKey, obstaclesLayerKey }: MapInfosGraphics,
    {
        scene
    }: MapGraphicsDeps
): MapGraphics => {

    const tilemap = scene.make.tilemap({ key: 'map' });

    const tiles = tilemap.addTilesetImage(tilemapKey, 'tiles');

    const decorLayer = tilemap.createStaticLayer(decorLayerKey, tiles, 0, 0)
    const obstaclesLayer = tilemap.createStaticLayer(obstaclesLayerKey, tiles, 0, 0)
        .setVisible(false);

    return {
        tilemap,

        hasObstacleAt({ x, y }: Position): boolean {
            return obstaclesLayer.hasTileAt(x, y);
        },

        tileToWorld(position: Position, center?: boolean): Position {
            if (center) {
                position = {
                    x: position.x + 0.5,
                    y: position.y + 0.5,
                };
            }

            return tilemap.tileToWorldXY(position.x, position.y);
        },

        worldToTile(position: Position): Position {
            return tilemap.worldToTileXY(position.x, position.y);
        }
    };
}
