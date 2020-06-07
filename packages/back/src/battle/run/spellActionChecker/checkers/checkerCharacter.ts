import { CheckerCreator } from '../SpellActionChecker';
import { characterIsAlive } from '../../entities/character/Character';

export const checkerCharacter: CheckerCreator = (cycle, mapManager) => ({ spellAction }, player, {spells}) => {
    const { currentTurn: {
        character
    } } = cycle.globalTurn;

    if (!characterIsAlive(character)) {
        console.log('check isAlive');
        return {
            success: false,
            reason: 'isAlive'
        };
    }

    const spell = spells.find(s => s.id === spellAction.spellId);

    if (!spell) {
        console.log('check spell');
        return {
            success: false,
            reason: 'spell'
        };
    }

    return {
        success: true
    };
};
