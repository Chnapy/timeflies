import { CheckerCreator } from '../SpellActionChecker';
import { characterIsAlive } from '../../entities/character/Character';

export const checkerCharacter: CheckerCreator = (cycle, mapManager) => ({ spellAction }, player, get) => {
    const spells = get('spells');

    const { currentTurn: {
        getCharacter
    } } = cycle.globalTurn;

    if (!characterIsAlive(getCharacter())) {
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
