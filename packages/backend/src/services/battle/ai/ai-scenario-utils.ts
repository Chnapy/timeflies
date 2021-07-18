import { CharacterId, Position, SerializableState, SpellId, StaticCharacter } from '@timeflies/common';
import { getSpellRangeArea } from '@timeflies/spell-effects';
import { Tile } from '@timeflies/tilemap-utils';
import { Battle } from '../battle';

export type AIScenarioUtils = ReturnType<typeof createAIScenarioUtils>;

type CreateAIScenarioUtilsProps = {
    battle: Battle;
    getInitialState: () => SerializableState;
    getCurrentState: () => SerializableState;
    currentCharacterId: CharacterId;
};

export const getDistanceBetween = (from: Position, to: Position) => Math.abs(to.x - from.x) + Math.abs(to.y - from.y);

export const createAIScenarioUtils = ({ battle, getInitialState, getCurrentState, currentCharacterId }: CreateAIScenarioUtilsProps) => {

    const getTargetableList = (characterList: StaticCharacter[], spellId: SpellId) => {
        const { spellRole } = battle.staticState.spells[ spellId ];

        const rangeArea = getSpellRangeArea(spellRole, {
            characterList: battle.staticCharacters.map(c => c.characterId),
            charactersPositions: getCurrentState().characters.position,
            lineOfSight: getCurrentState().spells.lineOfSight[ spellId ],
            playingCharacterId: currentCharacterId,
            rangeArea: getCurrentState().spells.rangeArea[ spellId ],
            tiledMap: battle.tiledMap
        });

        return characterList.filter(({ characterId }) => {
            const characterPosition = getCurrentState().characters.position[ characterId ];
            return rangeArea.some(p => p.id === characterPosition.id);
        });
    };

    const getCharacterWithLowestHealth = (characterList: StaticCharacter[]): StaticCharacter | null => {
        const healthMap = getCurrentState().characters.health;
        return [ ...characterList ].sort((a, b) =>
            healthMap[ a.characterId ] < healthMap[ b.characterId ] ? -1 : 1
        )[ 0 ] ?? null;
    };

    const getClosestCharacterListFromList = (characterList: StaticCharacter[]): StaticCharacter[] => {
        const pos = getCurrentState().characters.position[ currentCharacterId ];

        return [ ...characterList ].sort((a, b) => {
            const aPos = getCurrentState().characters.position[ a.characterId ];
            const aDistance = getDistanceBetween(pos, aPos);

            const bPos = getCurrentState().characters.position[ b.characterId ];
            const bDistance = getDistanceBetween(pos, bPos);

            return aDistance < bDistance ? -1 : 1;
        });
    };

    const getClosestRangeTilesToTarget = (spellId: SpellId, target: StaticCharacter, { maxDistance = Infinity, ignoreDistanceNull }: {
        maxDistance?: number;
        ignoreDistanceNull?: boolean;
    } = {}) => {
        const { spellRole } = battle.staticState.spells[ spellId ];

        const currentCharacterPos = getCurrentState().characters.position[ currentCharacterId ];
        const targetPos = getCurrentState().characters.position[ target.characterId ];

        const rangeArea = getSpellRangeArea(spellRole, {
            characterList: battle.staticCharacters.map(c => c.characterId),
            charactersPositions: getCurrentState().characters.position,
            lineOfSight: getCurrentState().spells.lineOfSight[ spellId ],
            playingCharacterId: currentCharacterId,
            rangeArea: getCurrentState().spells.rangeArea[ spellId ],
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
        const initialValue = selector(getInitialState());
        const currentValue = selector(getCurrentState());
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
