import { CharacterItem } from '@timeflies/character-list-panel';
import { CharacterId } from '@timeflies/common';
import React from 'react';
import { useCurrentEntities } from '../../hooks/use-entities';
import { usePlayerRelationFrom } from '../../hooks/use-player-relation-from';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

type BattleEndCharacterItemProps = {
    characterId: CharacterId;
};

const noop = () => { };

export const BattleEndCharacterItem: React.FC<BattleEndCharacterItemProps> = ({ characterId }) => {
    const { characterRole, playerId } = useBattleSelector(state => state.staticCharacters[ characterId ]);
    const { playerName, teamColor } = useBattleSelector(state => state.staticPlayers[ playerId ]);
    const health = useCurrentEntities(entities => entities.characters.health[ characterId ]);
    const getPlayerRelationFrom = usePlayerRelationFrom();

    return (
        <CharacterItem
            key={characterId}
            characterRole={characterRole}
            playerName={playerName}
            teamColor={teamColor}
            playerRelation={getPlayerRelationFrom(playerId)}
            isPlaying={false}
            health={health}
            onClick={noop}
            onMouseEnter={noop}
            onMouseLeave={noop}
        />
    );
};
