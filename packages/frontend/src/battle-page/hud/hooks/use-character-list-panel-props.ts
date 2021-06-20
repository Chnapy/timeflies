import { CharacterItemProps, CharacterListPanelProps } from '@timeflies/character-list-panel';
import { useCurrentEntities } from '../../hooks/use-entities';
import { usePlayerRelationFrom } from '../../hooks/use-player-relation-from';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useDetailsLogic } from '../details-panel/details-context';

export const useCharacterListPanelProps = (): CharacterListPanelProps => {

    const characterList = useBattleSelector(battleState => battleState.characterList);
    const staticPlayers = useBattleSelector(battleState => battleState.staticPlayers);
    const staticCharacters = useBattleSelector(battleState => battleState.staticCharacters);
    const currentCharactersHealth = useCurrentEntities(({ characters }) => characters.health);
    const playingCharacterId = useBattleSelector(battleState => battleState.playingCharacterId);
    const playerDisconnectedList = useBattleSelector(battleState => battleState.playerDisconnectedList);

    const getPlayerRelationFrom = usePlayerRelationFrom();

    const { characterHover, characterClick } = useDetailsLogic();

    const characterMap = characterList.reduce<CharacterListPanelProps[ 'characterMap' ]>((acc, characterId) => {
        const { characterRole, playerId } = staticCharacters[ characterId ];
        const { playerName, teamColor } = staticPlayers[ playerId ];
        const health = currentCharactersHealth[ characterId ];

        const playerRelation = getPlayerRelationFrom(playerId);

        const itemProps: CharacterItemProps = {
            playerName,
            teamColor: teamColor!,
            playerRelation,
            characterRole,
            health,
            isPlaying: playingCharacterId === characterId,
            isDisconnected: playerDisconnectedList.includes(playerId)
        };
        acc[ characterId ] = itemProps;

        return acc;
    }, {});

    return {
        characterList,
        characterMap,
        onMouseEnter: characterHover,
        onMouseLeave: () => characterHover(null),
        onClick: characterClick
    };
};
