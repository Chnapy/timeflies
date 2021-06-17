import { CharacterId, CharacterUtils } from '@timeflies/common';
import { logger } from '@timeflies/devtools';
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

    if(!isTurnCharacter(characterId)) {
        logger.info('Spell check failed: not character turn.');
        return false;
    }
    
    if(!isCharacterAlive(characterId)) {
        logger.info('Spell check failed: character not alive.');
        return false;
    }

    return true;
};
