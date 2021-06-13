import { PlayerId, PlayerRelation } from '@timeflies/common';
import { useMyPlayerId } from '../../login-page/hooks/use-my-player-id';
import { useBattleSelector } from '../store/hooks/use-battle-selector';

export const usePlayerRelationFrom = () => {
    const myPlayerId = useMyPlayerId();
    const staticPlayers = useBattleSelector(battleState => battleState.staticPlayers);

    return (playerId: PlayerId): PlayerRelation => {
        const myPlayer = staticPlayers[ myPlayerId ];
        const otherPlayer = staticPlayers[ playerId ];

        return playerId === myPlayerId
            ? 'me'
            : (
                otherPlayer.teamColor === myPlayer.teamColor
                    ? 'ally'
                    : 'enemy'
            );
    };
};
