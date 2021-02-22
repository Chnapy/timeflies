import { Position } from '@timeflies/common';
import { Area, Tile } from '@timeflies/tilemap-utils';
import { useTiledMapAssets } from '../../../../hooks/use-tiled-map-assets';
import { useBattleSelector } from '../../../../store/hooks/use-battle-selector';
import { useRangeAreaContext } from '../../range-area/view/range-area-context';
import { useTileHoverContext } from '../../tile-hover/view/tile-hover-context';

export const useComputeActionArea = (): Position[] => {
    const tiledMap = useTiledMapAssets()?.schema;

    const staticSpell = useBattleSelector(battle => battle.selectedSpellId
        ? battle.staticSpells[ battle.selectedSpellId ]
        : null);
    const actionArea = useBattleSelector(battle => staticSpell
        ? battle.futureSpells.actionArea[ staticSpell.spellId ]
        : 0);

    const { rangeArea } = useRangeAreaContext();
    const tileHoverPos = useTileHoverContext();

    if (!tiledMap || !tileHoverPos || !staticSpell) {
        return [];
    }

    const isInRangeArea = rangeArea.some(p => p.id === tileHoverPos.id);
    if(!isInRangeArea) {
        return [];
    }

    return Area.getArea(tileHoverPos, actionArea, tiledMap)
        .filter(p => Tile.getTileTypeFromPosition(p, tiledMap) === 'default');
};
