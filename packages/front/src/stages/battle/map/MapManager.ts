import { MapInfos, TiledManager, TiledMapAssets } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { Pathfinder } from './Pathfinder';
import { TiledMapGraphic } from '../graphic/tiledMap/TiledMapGraphic';

export interface MapManager extends
    Pick<Pathfinder, 'calculatePath'> {
    readonly tiledManager: TiledManager;
    refreshPathfinder(): void;
}

interface Dependencies {
    tiledManagerCreator: typeof TiledManager;
    pathfinderCreator: typeof Pathfinder;
    graphicCreator: typeof TiledMapGraphic;
}

export const MapManager = (
    mapAssets: TiledMapAssets,
    mapInfos: MapInfos,
    { pathfinderCreator, tiledManagerCreator, graphicCreator }: Dependencies = {
        pathfinderCreator: Pathfinder,
        tiledManagerCreator: TiledManager,
        graphicCreator: TiledMapGraphic
    }
): MapManager => {

    const tiledManager = tiledManagerCreator(mapAssets, {
        defaultTilelayerName: mapInfos.decorLayerKey,
        obstacleTilelayerName: mapInfos.obstaclesLayerKey
    });

    const { characters } = serviceBattleData('future');

    // const graphics = graphicCreator(tiledManager);

    const pathfinder = pathfinderCreator(
        tiledManager,
        () => characters.map(c => c.position)
    );

    return {

        tiledManager,

        refreshPathfinder() {
            pathfinder.refreshGrid();
        },

        calculatePath: pathfinder.calculatePath,
    };
};
