import { PlayerId, PlayerRelation } from '@timeflies/common';
import { useBattleSelector } from '../store/hooks/use-battle-selector';

export const usePlayerRelationFrom = () => {
    const myPlayerId = useBattleSelector(battleState => battleState.myPlayerId);
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
