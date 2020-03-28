import { MapManager } from './MapManager';

export const seedMapManager = (): MapManager => {
    return {
        tiledManager: {
            getTileType(position) { return null }
        },
        refreshPathfinder() { },
        calculatePath() { return { cancel: () => true, promise: Promise.resolve([]) } },
    };
};
