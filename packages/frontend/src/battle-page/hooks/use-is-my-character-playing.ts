import {useBattleSelector} from '../store/hooks/use-battle-selector';

export const useIsMyCharacterPlaying = () => {
    const playingCharacterId = useBattleSelector(battle => battle.playingCharacterId);
    return useBattleSelector(battle => playingCharacterId
        ? battle.staticCharacters[playingCharacterId].playerId === battle.myPlayerId
        : false);
};
