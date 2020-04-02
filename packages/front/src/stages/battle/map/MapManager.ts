import { MapConfig, TiledManager, TiledMapAssets } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { Pathfinder } from './Pathfinder';
import { Character } from '../entities/character/Character';

export interface MapManager extends
    Pick<Pathfinder, 'calculatePath'> {
    readonly tiledManager: TiledManager;
    refreshPathfinder(): void;
}

export interface MapManagerDependencies {
    tiledManagerCreator: typeof TiledManager;
    pathfinderCreator: typeof Pathfinder;
    getFutureCharacters: () => Character[];
}

export const MapManager = (
    mapAssets: TiledMapAssets,
    {
        defaultTilelayerName,
        obstacleTilelayerName
    }: Pick<MapConfig, 'defaultTilelayerName' | 'obstacleTilelayerName'>,
    { pathfinderCreator, tiledManagerCreator, getFutureCharacters }: MapManagerDependencies = {
        pathfinderCreator: Pathfinder,
        tiledManagerCreator: TiledManager,
        getFutureCharacters: () => serviceBattleData('future').characters
    }
): MapManager => {

    const tiledManager = tiledManagerCreator(mapAssets, {
        defaultTilelayerName,
        obstacleTilelayerName
    });

    const characters = getFutureCharacters();

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
