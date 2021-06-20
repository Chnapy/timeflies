import { CharacterItem } from '@timeflies/character-list-panel';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { useCurrentEntities } from '../../hooks/use-entities';
import { useIsSpectator } from '../../hooks/use-is-spectator';
import { usePlayerRelationFrom } from '../../hooks/use-player-relation-from';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

type BattleEndCharacterItemProps = {
    characterId: CharacterId;
};

const noop = () => { };

export const BattleEndCharacterItem: React.FC<BattleEndCharacterItemProps> = ({ characterId }) => {
    const { characterRole, playerId } = useBattleSelector(state => state.staticCharacters[ characterId ]);
    const { playerName, teamColor } = useBattleSelector(state => state.staticPlayers[ playerId ]);
    const playerDisconnectedList = useBattleSelector(battleState => battleState.playerDisconnectedList);
    const health = useCurrentEntities(entities => entities.characters.health[ characterId ]);
    const getPlayerRelationFrom = usePlayerRelationFrom();
    const isSpectator = useIsSpectator();

    return (
        <CharacterItem
            key={characterId}
            characterRole={characterRole}
            playerName={playerName}
            teamColor={teamColor!}
            playerRelation={isSpectator ? 'me' : getPlayerRelationFrom(playerId)}
            isPlaying={false}
            isDisconnected={playerDisconnectedList.includes(playerId)}
            health={health}
            onClick={noop}
            onMouseEnter={noop}
            onMouseLeave={noop}
        />
    );
};
