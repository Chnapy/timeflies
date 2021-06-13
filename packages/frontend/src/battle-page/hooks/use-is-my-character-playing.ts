import { PlayerId } from '@timeflies/common';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { BattleState } from '../store/battle-state';
import { useBattleSelector } from '../store/hooks/use-battle-selector';

export const isMyCharacterPlayingSelector = (battle: BattleState, myPlayerId: PlayerId) => battle.playingCharacterId
    ? battle.staticCharacters[ battle.playingCharacterId ].playerId === myPlayerId
    : false;

export const useIsMyCharacterPlaying = () => {
    const myPlayerId = useMyPlayerId();
    return useBattleSelector(battle => isMyCharacterPlayingSelector(battle, myPlayerId));
};
