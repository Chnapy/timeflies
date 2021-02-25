import { Area, Tile } from '@timeflies/tilemap-utils';
import { futureEntitiesSelector } from '../../hooks/use-entities';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { useRangeAreaContext } from '../../range-area/view/range-area-context';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useTileHoverContext } from '../../tile-interactive/view/tile-hover-context';
import { ActionPreviewContextValueGeo } from '../view/action-preview-context';

const resultEmpty: ActionPreviewContextValueGeo = {
    targetPosition: null,
    actionArea: []
};

export const useComputeActionArea = (): ActionPreviewContextValueGeo => {
    const tiledMap = useTiledMapAssets()?.schema;

    const actionAreaValue = useBattleSelector(battle => battle.selectedSpellId
        ? futureEntitiesSelector(battle).spells.actionArea[ battle.selectedSpellId ]
        : 0);

    const { rangeArea } = useRangeAreaContext();
    const tileHoverPos = useTileHoverContext();

    if (!tiledMap || !tileHoverPos || !actionAreaValue) {
        return resultEmpty;
    }

    const isInRangeArea = rangeArea.some(p => p.id === tileHoverPos.id);
    if (!isInRangeArea) {
        return resultEmpty;
    }

    const actionArea = Area.getArea(tileHoverPos, actionAreaValue, tiledMap)
        .filter(p => Tile.getTileTypeFromPosition(p, tiledMap) === 'default');

    return {
        targetPosition: actionArea.length > 0 ? tileHoverPos : null,
        actionArea
    };
};
