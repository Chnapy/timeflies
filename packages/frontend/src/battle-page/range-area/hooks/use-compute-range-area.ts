import { getSpellRangeArea } from '@timeflies/spell-effects';
import { useTiledMapAssets } from '../../assets-loader/hooks/use-tiled-map-assets';
import { characterAliveListSelector } from '../../hooks/character-alive-list-selector';
import { useFutureEntities } from '../../hooks/use-entities';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

export const useComputeRangeArea = () => {
    const selectedSpellId = useBattleSelector(battle => battle.selectedSpellId);
    const spellRole = useBattleSelector(battle => selectedSpellId ? battle.staticSpells[ selectedSpellId ].spellRole : null);
    const tiledMap = useTiledMapAssets()?.schema;
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    const characterAliveList = useFutureEntities(characterAliveListSelector);
    const charactersPositions = useFutureEntities(({ characters }) => characters.position);
    const rangeAreaValue = useFutureEntities(({ spells }) => selectedSpellId ? spells.rangeArea[ selectedSpellId ] : 0);
    const lineOfSight = useFutureEntities(({ spells }) => selectedSpellId ? spells.lineOfSight[ selectedSpellId ] : false);

    if (!selectedSpellId || !spellRole || !playingCharacterId || !tiledMap) {
        return [];
    }

    return getSpellRangeArea(spellRole, {
        tiledMap,
        characterList: characterAliveList,
        charactersPositions,
        playingCharacterId,
        rangeArea: rangeAreaValue,
        lineOfSight
    });
};
