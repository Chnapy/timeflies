import { CheckerCreator } from '../SpellActionChecker';

export const checkerCharacter: CheckerCreator = (cycle, mapManager) => ({ spellAction }, player) => {
    const { currentTurn: {
        character
    } } = cycle.globalTurn;

    if (!character.isAlive) {
        console.log('check isAlive');
        return {
            success: false,
            reason: 'isAlive'
        };
    }

    const spell = character.spells.find(s => s.staticData.id === spellAction.spellId);

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
