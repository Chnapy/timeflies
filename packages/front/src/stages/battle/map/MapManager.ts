import { BresenhamPoint, equals, Position, TiledManager, TiledMapAssets } from '@timeflies/shared';
import { serviceBattleData } from '../../../services/serviceBattleData';
import { serviceEvent } from '../../../services/serviceEvent';
import { Character } from '../entities/character/Character';
import { BattleCommitAction } from '../snapshot/snapshot-manager-actions';
import { Pathfinder } from './Pathfinder';
import { SpellActionTimerEndAction } from '../spellAction/spell-action-actions';

export interface MapManager extends Pick<Pathfinder, 'calculatePath'> {
    readonly tiledManager: TiledManager;
    refreshPathfinder(): void;
    getRangeArea(center: Position, r: number, charactersPos: Position[]): Position[];
}

export interface MapManagerDependencies {
    tiledManagerCreator: typeof TiledManager;
    pathfinderCreator: typeof Pathfinder;
    getFutureCharacters: () => Character<'future'>[];
}

export const MapManager = (
    mapAssets: TiledMapAssets,
    { pathfinderCreator, tiledManagerCreator, getFutureCharacters }: MapManagerDependencies = {
        pathfinderCreator: Pathfinder,
        tiledManagerCreator: TiledManager,
        getFutureCharacters: () => serviceBattleData('future').characters
    }
): MapManager => {

    const { onAction } = serviceEvent();

    const tiledManager = tiledManagerCreator(mapAssets);

    const characters = getFutureCharacters();

    const pathfinder = pathfinderCreator(
        tiledManager,
        () => characters
            .filter(c => c.isAlive)
            .map(c => c.position)
    );
    pathfinder.refreshGrid();


    const getRangeArea = (center: Position, r: number, charactersPos: Position[]): Position[] => {

        charactersPos = charactersPos
            .filter(p => !equals(p)(center));

        const isPositionTargetable = ({ position, tileType }: BresenhamPoint): 'yes' | 'no' | 'last' => {

            if (tileType === 'obstacle') {
                return 'no';
            }

            if (charactersPos.some(equals(position))) {
                return 'last';
            }

            return 'yes';
        };

        const area = tiledManager.getArea(center, r);

        return area.filter(p => {


            const points = tiledManager.getBresenhamLine(center, p);

            for (let i = 0; i < points.length; i++) {
                const check = isPositionTargetable(points[ i ]);
                if (check === 'no'
                    || (check === 'last' && i < points.length - 1)) {
                    return false;
                }
            }
            return true;
        });
    };

    onAction(BattleCommitAction, () => pathfinder.refreshGrid());

    onAction(SpellActionTimerEndAction, ({ removed }) => {

        if (removed) {
            setImmediate(() => pathfinder.refreshGrid());
        }
    });

    return {

        tiledManager,

        refreshPathfinder() {
            pathfinder.refreshGrid();
        },

        calculatePath: pathfinder.calculatePath,

        getRangeArea
    };
};
