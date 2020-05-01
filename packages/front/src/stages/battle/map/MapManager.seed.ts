import { MapConfig, TiledMapSeedKey } from '@timeflies/shared';
import { MapManager, MapManagerDependencies } from './MapManager';
import { seedTiledMapAssetsWithImg } from './TiledMap.seed';

export const seedMapConfig = (mapKey: TiledMapSeedKey): MapConfig => {

    return {
        id: '',
        schemaUrl: 'placeholder',
        height: 10,
        width: 10,
        name: '',
        nbrCharactersPerTeam: 1,
        nbrTeams: 1,
        previewUrl: '',
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

    const assets = seedTiledMapAssetsWithImg(mapKey);

    return MapManager(assets, deps);
};

