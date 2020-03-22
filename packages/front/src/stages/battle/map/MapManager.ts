import { MapInfos, TiledManager, TiledMap } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { Pathfinder } from './Pathfinder';

export interface MapManager extends
    Pick<Pathfinder, 'calculatePath'>,
    Pick<TiledManager, 'getTileType'> {
    refreshPathfinder(): void;
    // Pick<MapGraphics, 'tileToWorld' | 'worldToTile'>,
    // worldToTileIfExist(position: Position): Position | null;
}

interface Dependencies {
    tiledManagerCreator: typeof TiledManager;
    pathfinderCreator: typeof Pathfinder;
}

export const MapManager = (
    mapSchema: TiledMap,
    mapInfos: MapInfos,
    // getGraphics: () => MapGraphics,
    { pathfinderCreator, tiledManagerCreator }: Dependencies = {
        pathfinderCreator: Pathfinder,
        tiledManagerCreator: TiledManager
    }
): MapManager => {

    const tiledManager = tiledManagerCreator(mapSchema, {
        defaultTilelayerName: mapInfos.decorLayerKey,
        obstacleTilelayerName: mapInfos.obstaclesLayerKey
    });

    const { characters } = serviceBattleData('future');

    // const graphics = getGraphics();

    // const { tilemap, hasObstacleAt, tileToWorld, worldToTile } = graphics;

    const pathfinder = pathfinderCreator(
        tiledManager,
        () => characters.map(c => c.position)
    );

    return {

        refreshPathfinder() {
            pathfinder.refreshGrid();
        },

        calculatePath: pathfinder.calculatePath,

        getTileType: tiledManager.getTileType

        // tileToWorld,
        // worldToTile,
        // worldToTileIfExist(position: Position): Position | null {
        //     // TODO
        // }
    };
};
