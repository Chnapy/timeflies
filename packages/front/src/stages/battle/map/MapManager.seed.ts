import { MapManager } from './MapManager';

export const seedMapManager = (): MapManager => {
    return {
        refreshPathfinder() { },
        tileToWorld(position, center) { return { x: -1, y: -1 } },
        worldToTile(position) { return { x: -1, y: -1 } },
        worldToTileIfExist(position) { return null },
        calculatePath() { return { cancel: () => true, promise: Promise.resolve([]) } }
    };
};
