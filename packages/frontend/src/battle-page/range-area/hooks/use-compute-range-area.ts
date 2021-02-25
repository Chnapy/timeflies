import { Position } from '@timeflies/common';
import { Area, Tile } from '@timeflies/tilemap-utils';
import { useFutureEntities } from '../../hooks/use-entities';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

export const useComputeRangeArea = () => {
    const selectedSpellId = useBattleSelector(battle => battle.selectedSpellId);
    const tiledMapSchema = useTiledMapAssets()?.schema;
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    const characterList = useBattleSelector(battle => battle.characterList);
    const charactersPositions = useFutureEntities(({ characters }) => characters.position);
    const rangeAreaValue = useFutureEntities(({ spells }) => selectedSpellId ? spells.rangeArea[ selectedSpellId ] : 0);
    const lineOfSight = useFutureEntities(({ spells }) => selectedSpellId ? spells.lineOfSight[ selectedSpellId ] : false);

    if (!selectedSpellId || !playingCharacterId || !tiledMapSchema) {
        return [];
    }

    const characterPosition = charactersPositions[ playingCharacterId ];

    const rawArea = Area.getArea(characterPosition, rangeAreaValue, tiledMapSchema)
        .filter(pos => Tile.getTileTypeFromPosition(pos, tiledMapSchema) === 'default');

    if (!lineOfSight) {
        return rawArea;
    }

    const isPositionOccupied = (pos: Position) => characterList
        .filter(characterId => characterId !== playingCharacterId)
        .some(characterId => {
            return charactersPositions[ characterId ].id === pos.id;
        });

    return rawArea
        .filter(pos => {

            const bresenhamLine = Area.getBresenhamLine(characterPosition, pos, tiledMapSchema);

            const hasObstacle = bresenhamLine.some(({ tileType }) => tileType === 'obstacle');
            if (hasObstacle) {
                return false;
            }

            return !isPositionOccupied(pos);
        });
};
