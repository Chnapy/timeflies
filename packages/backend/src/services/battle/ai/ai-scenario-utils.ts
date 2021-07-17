import { CharacterId, Position, SerializableState, SpellId, StaticCharacter } from '@timeflies/common';
import { getSpellRangeArea } from '@timeflies/spell-effects';
import { Tile } from '@timeflies/tilemap-utils';
import { Battle } from '../battle';

export type AIScenarioUtils = ReturnType<typeof createAIScenarioUtils>;

type CreateAIScenarioUtilsProps = {
    battle: Battle;
    initialState: SerializableState;
    currentState: SerializableState;
    currentCharacterId: CharacterId;
};

export const createAIScenarioUtils = ({ battle, initialState, currentState, currentCharacterId }: CreateAIScenarioUtilsProps) => {

    const getTargetableList = (characterList: StaticCharacter[], spellId: SpellId) => {
        const { spellRole } = battle.staticState.spells[ spellId ];

        const rangeArea = getSpellRangeArea(spellRole, {
            characterList: battle.staticCharacters.map(c => c.characterId),
            charactersPositions: currentState.characters.position,
            lineOfSight: currentState.spells.lineOfSight[ spellId ],
            playingCharacterId: currentCharacterId,
            rangeArea: currentState.spells.rangeArea[ spellId ],
            tiledMap: battle.tiledMap
        });

        return characterList.filter(({ characterId }) => {
            const characterPosition = currentState.characters.position[ characterId ];
            return rangeArea.some(p => p.id === characterPosition.id);
        });
    };

    const getCharacterWithLowestHealth = (characterList: StaticCharacter[]): StaticCharacter | null => {
        const healthMap = currentState.characters.health;
        return [ ...characterList ].sort((a, b) =>
            healthMap[ a.characterId ] < healthMap[ b.characterId ] ? -1 : 1
        )[ 0 ] ?? null;
    };

    const getDistanceBetween = (from: Position, to: Position) => Math.abs(to.x - from.x) + Math.abs(to.y - from.y);

    const getClosestCharacterListFromList = (characterList: StaticCharacter[]): StaticCharacter[] => {
        const pos = currentState.characters.position[ currentCharacterId ];

        return [ ...characterList ].sort((a, b) => {
            const aPos = currentState.characters.position[ a.characterId ];
            const aDistance = getDistanceBetween(pos, aPos);

            const bPos = currentState.characters.position[ b.characterId ];
            const bDistance = getDistanceBetween(pos, bPos);

            return aDistance < bDistance ? -1 : 1;
        });
    };

    const getClosestRangeTilesToTarget = (spellId: SpellId, target: StaticCharacter, { maxDistance = Infinity, ignoreDistanceNull }: {
        maxDistance?: number;
        ignoreDistanceNull?: boolean;
    } = {}) => {
        const { spellRole } = battle.staticState.spells[ spellId ];

        const currentCharacterPos = currentState.characters.position[ currentCharacterId ];
        const targetPos = currentState.characters.position[ target.characterId ];

        const rangeArea = getSpellRangeArea(spellRole, {
            characterList: battle.staticCharacters.map(c => c.characterId),
            charactersPositions: currentState.characters.position,
            lineOfSight: currentState.spells.lineOfSight[ spellId ],
            playingCharacterId: currentCharacterId,
            rangeArea: currentState.spells.rangeArea[ spellId ],
            tiledMap: battle.tiledMap
        })
            .map(pos => ({
                pos,
                distance: getDistanceBetween(pos, targetPos),
                distanceFromLauncher: getDistanceBetween(pos, currentCharacterPos)
            }))
            .filter(({ pos, distanceFromLauncher }) => Tile.getTileTypeFromPosition(pos, battle.tiledMap) === 'default'
                && distanceFromLauncher <= maxDistance && (!ignoreDistanceNull || distanceFromLauncher > 0)
            )
            .sort((a, b) => a.distance < b.distance ? -1 : 1);

        return rangeArea;
    };

    const getStateVariablePercent = (selector: (state: SerializableState) => number) => {
        const initialValue = selector(initialState);
        const currentValue = selector(currentState);
        return currentValue / initialValue;
    };

    return {
        getTargetableList,
        getCharacterWithLowestHealth,
        getClosestCharacterListFromList,
        getClosestRangeTilesToTarget,
        getStateVariablePercent
    };
};
