import { MapConfig, TiledManager, TiledMapAssets } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceEvent } from '../../../services/serviceEvent';
import { BStateAction } from '../battleState/BattleStateSchema';
import { Character } from '../entities/character/Character';
import { Pathfinder } from './Pathfinder';

export interface MapManager extends
    Pick<Pathfinder, 'calculatePath'> {
    readonly tiledManager: TiledManager;
    refreshPathfinder(): void;
}

export interface MapManagerDependencies {
    tiledManagerCreator: typeof TiledManager;
    pathfinderCreator: typeof Pathfinder;
    getFutureCharacters: () => Character<'future'>[];
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

    const { onAction } = serviceEvent();

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

    onAction<BStateAction>('battle/state/event', action => {

        if (action.eventType === 'SPELL-LAUNCH') {

            // be sure to run that after spell had touched the character
            setImmediate(() => {
                pathfinder.refreshGrid();
            });
        }
    });

    return {

        tiledManager,

        refreshPathfinder() {
            pathfinder.refreshGrid();
        },

        calculatePath: pathfinder.calculatePath,
    };
};
