import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useBattleSelector } from '../store/hooks/use-battle-selector';

export const useIsSpectator = () => {
    const myPlayerId = useMyPlayerId();
    return useBattleSelector(battle => battle.staticPlayers[ myPlayerId ].type === 'spectator');
};
