import { useAssetMap } from '@timeflies/assets-loader';
import { useBattleSelector } from '../store/hooks/use-battle-selector';

export const useTiledMapAssets = () => {
    const tiledMapName = useBattleSelector(battle => battle.tiledMapInfos.name);
    return useAssetMap(tiledMapName);
};
