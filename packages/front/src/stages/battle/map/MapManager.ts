import { MapGraphics } from '../graphics/MapGraphics';
import { BattleData } from "../../../BattleData";
import { Pathfinder } from './Pathfinder';

export interface MapManager extends Pick<MapGraphics, 'tileToWorld' | 'worldToTile'> {
    refreshPathfinder(): void;
}

export interface MapManagerDeps {
    battleData: Pick<BattleData, 'characters'>;
    getGraphics: () => MapGraphics;
    getPathfinder: typeof Pathfinder;
}

export const MapManager = ({ getGraphics, getPathfinder, battleData }: MapManagerDeps): MapManager => {

    const graphics = getGraphics();

    const { tilemap, hasObstacleAt, tileToWorld, worldToTile } = graphics;

    const pathfinder = getPathfinder(
        { tilemap, hasObstacleAt },
        () => battleData.characters.map(c => c.position)
    );

    return {

        refreshPathfinder() {
            pathfinder.refreshGrid();
        },

        tileToWorld,
        worldToTile
    };
};
