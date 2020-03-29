import { MapConfig, TiledManager, TiledMapAssets } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { Pathfinder } from './Pathfinder';

export interface MapManager extends
    Pick<Pathfinder, 'calculatePath'> {
    readonly tiledManager: TiledManager;
    refreshPathfinder(): void;
}

export interface MapManagerDependencies {
    tiledManagerCreator: typeof TiledManager;
    pathfinderCreator: typeof Pathfinder;
}

export const MapManager = (
    mapAssets: TiledMapAssets,
    {
        defaultTilelayerName,
        obstacleTilelayerName
    }: Pick<MapConfig, 'defaultTilelayerName' | 'obstacleTilelayerName'>,
    { pathfinderCreator, tiledManagerCreator }: MapManagerDependencies = {
        pathfinderCreator: Pathfinder,
        tiledManagerCreator: TiledManager
    }
): MapManager => {

    const tiledManager = tiledManagerCreator(mapAssets, {
        defaultTilelayerName,
        obstacleTilelayerName
    });

    const { characters } = serviceBattleData('future');

    const pathfinder = pathfinderCreator(
        tiledManager,
        () => characters.map(c => c.position)
    );
    pathfinder.refreshGrid();

    return {

        tiledManager,

        refreshPathfinder() {
            pathfinder.refreshGrid();
        },

        calculatePath: pathfinder.calculatePath,
    };
};
