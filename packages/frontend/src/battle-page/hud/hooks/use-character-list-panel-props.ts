import { CharacterItemProps, CharacterListPanelProps } from '@timeflies/character-list-panel';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';

export const useCharacterListPanelProps = (): CharacterListPanelProps => {

    const characterList = useBattleSelector(battleState => battleState.characterList);
    const myPlayerId = useBattleSelector(battleState => battleState.myPlayerId);
    const staticPlayers = useBattleSelector(battleState => battleState.staticPlayers);
    const staticCharacters = useBattleSelector(battleState => battleState.staticCharacters);
    const currentCharactersHealth = useBattleSelector(battleState => battleState.currentCharacters.health);
    const playingCharacterId = useBattleSelector(battleState => battleState.playingCharacterId);

    const myPlayer = staticPlayers[ myPlayerId ];

    const characterMap = characterList.reduce<CharacterListPanelProps[ 'characterMap' ]>((acc, characterId) => {
        const { characterRole, playerId } = staticCharacters[ characterId ];
        const { playerName, teamColor } = staticPlayers[ playerId ];
        const health = currentCharactersHealth[ characterId ];

        const playerRelation = playerId === myPlayerId
            ? 'me'
            : (
                teamColor === myPlayer.teamColor
                    ? 'ally'
                    : 'enemy'
            );

        const itemProps: CharacterItemProps = {
            playerName,
            teamColor,
            playerRelation,
            characterRole,
            health,
            isPlaying: playingCharacterId === characterId
        };
        acc[ characterId ] = itemProps;

        return acc;
    }, {});

    return {
        characterList,
        characterMap
    };
};
