import { Checker, CheckerParams } from '../checker';
import { CharacterId, CharacterUtils } from '@timeflies/common';

const getHelper = ({ context }: CheckerParams) => ({
    isTurnCharacter: (characterId: CharacterId) => characterId === context.currentTurn.characterId,
    isCharacterAlive: (characterId: CharacterId) => {
        const characterVariables = context.state.characters[ characterId ];

        return CharacterUtils.isAlive(characterVariables.health);
    }
})

export const checkCharacter: Checker = (params) => {
    const { isTurnCharacter, isCharacterAlive } = getHelper(params);

    const { spellAction, context } = params;
    const { characterId } = context.staticState.spells[ spellAction.spellId ] ?? {};

    return isTurnCharacter(characterId)
        && isCharacterAlive(characterId);
};
