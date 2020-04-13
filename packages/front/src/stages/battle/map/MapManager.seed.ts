import { MapConfig } from '@timeflies/shared';
import { MapManager, MapManagerDependencies } from './MapManager';
import { seedTiledConfig, seedTiledMapAssets, TiledMapSeedKey } from './TiledMap.seed';

export const seedMapConfig = (mapKey: TiledMapSeedKey): MapConfig => {

    return {
        ...seedTiledConfig(mapKey),
        id: '',
        initLayerName: 'todo',
        schemaUrl: 'placeholder'
    };
};

export const seedMapManager = (type: 'real' | 'fake', mapKey: TiledMapSeedKey = 'map_1', deps?: MapManagerDependencies): MapManager => {

    if (type === 'fake') {
        return {
            tiledManager: {
                getTileType(position) { return null }
            } as any,
            refreshPathfinder() { },
            calculatePath() { return { cancel: () => true, promise: Promise.resolve([]) } },
            getRangeArea(center, r, charactersPos) { return [] }
        };
    }

    const assets = seedTiledMapAssets(mapKey);

    const mapConfig = seedMapConfig(mapKey);

    return MapManager(assets, mapConfig, deps);
};

