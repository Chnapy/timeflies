import { BattleState } from '../store/battle-state';
import { useBattleSelector } from '../store/hooks/use-battle-selector';

export const isMyCharacterPlayingSelector = (battle: BattleState) => battle.playingCharacterId
    ? battle.staticCharacters[ battle.playingCharacterId ].playerId === battle.myPlayerId
    : false;

export const useIsMyCharacterPlaying = () => useBattleSelector(isMyCharacterPlayingSelector);
