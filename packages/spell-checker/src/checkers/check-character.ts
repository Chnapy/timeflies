import { CharacterId, CharacterUtils } from '@timeflies/common';
import { Checker, CheckerParams } from '../checker';

const getHelper = ({ context }: CheckerParams) => ({
    isTurnCharacter: (characterId: CharacterId) => characterId === context.currentTurn.characterId,
    isCharacterAlive: (characterId: CharacterId) => {
        const { health } = context.state.characters;

        return CharacterUtils.isAlive(health[ characterId ]);
    }
})

export const checkCharacter: Checker = (params) => {
    const { isTurnCharacter, isCharacterAlive } = getHelper(params);

    const { spellAction, context } = params;
    const { characterId } = context.staticState.spells[ spellAction.spellId ] ?? {};

    return isTurnCharacter(characterId)
        && isCharacterAlive(characterId);
};
