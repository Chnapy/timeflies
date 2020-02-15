import { MapInfos } from '@timeflies/shared';
import { MapGraphics, MapGraphicsDeps } from '../graphics/MapGraphics';
import { Pathfinder } from '../phaser/map/Pathfinder';
import { BattleData } from '../phaser/scenes/BattleScene';

export interface MapManager extends Pick<MapGraphics, 'tileToWorld' | 'worldToTile'> {
    refreshPathfinder(): void;
}

export interface MapManagerDeps extends MapGraphicsDeps {
    battleData: Pick<BattleData, 'characters'>;
}

export const MapManager = (mapInfos: MapInfos, deps: MapManagerDeps): MapManager => {

    const graphics = MapGraphics(mapInfos, deps);

    const { tilemap, obstaclesLayer, tileToWorld, worldToTile } = graphics;

    const pathfinder = new Pathfinder({ tilemap, obstaclesLayer: obstaclesLayer as any }, deps);

    return {

        refreshPathfinder() {
            pathfinder.setGrid();
        },

        tileToWorld,
        worldToTile
    };
};
