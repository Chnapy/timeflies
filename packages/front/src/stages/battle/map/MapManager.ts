import { MapGraphics } from '../graphics/MapGraphics';
import { Pathfinder } from './Pathfinder';
import { Position } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';

export interface MapManager extends
    Pick<MapGraphics, 'tileToWorld' | 'worldToTile'>,
    Pick<Pathfinder, 'calculatePath'> {
    refreshPathfinder(): void;
    worldToTileIfExist(position: Position): Position | null;
}

interface Dependencies {
    pathfinderCreator: typeof Pathfinder;
}

export const MapManager = (
    getGraphics: () => MapGraphics,
    { pathfinderCreator }: Dependencies = { pathfinderCreator: Pathfinder }
): MapManager => {

    const { characters } = serviceBattleData('future');

    const graphics = getGraphics();

    const { tilemap, hasObstacleAt, tileToWorld, worldToTile } = graphics;

    const pathfinder = pathfinderCreator(
        { tilemap, hasObstacleAt },
        () => characters.map(c => c.position)
    );

    const { calculatePath } = pathfinder;

    return {

        refreshPathfinder() {
            pathfinder.refreshGrid();
        },

        calculatePath,

        tileToWorld,
        worldToTile,
        worldToTileIfExist(position: Position): Position | null {
            // TODO
        }
    };
};
