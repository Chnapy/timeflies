import { CharacterId, CharacterUtils } from '@timeflies/common';
import { SpellEffect, SpellEffectFnParams } from './spell-effects-params';

export const createSpellEffectHelper = ({ spellAction, context }: SpellEffectFnParams) => {
    const { currentTurn, staticState, state } = context;

    const getCharacterById = (characterId: CharacterId) => ({
        ...staticState.characters[ characterId ],
        ...state.characters[ characterId ]
    });

    const getHitCharacters = () => {
        const { actionArea } = context.map;

        return Object.entries(state.characters)
            .filter(([ characterId, { position } ]) =>
                actionArea.some(pos => pos.id === position.id))
            .map(([ characterId ]) => getCharacterById(characterId));
    };

    return {
        getLauncher: () => getCharacterById(currentTurn.characterId),
        getSpell: () => {
            const { spellId } = spellAction;

            return {
                ...staticState.spells[ spellId ],
                ...state.spells[ spellId ]
            };
        },
        getHitCharactersAlive: () => {
            return getHitCharacters()
                .filter(character => CharacterUtils.isAlive(character.health));
        },
        targetPos: spellAction.targetPos,
    };
};
type SpellEffectHelper = ReturnType<typeof createSpellEffectHelper>;

export type SpellEffectFn = (helper: SpellEffectHelper) => SpellEffect;
