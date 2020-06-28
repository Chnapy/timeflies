import { CheckerCreator } from '../SpellActionChecker';
import { assertIsDefined } from '@timeflies/shared';

export const checkerTime: CheckerCreator = (cycle, mapManager) => ({ sendTime, spellAction }, player, get) => {

    const spells = get('spells');

    const { currentTurn } = cycle.globalTurn;

    if (sendTime < currentTurn.startTime) {
        console.log('check startTime');
        return {
            success: false,
            reason: 'startTime'
        };
    }

    const spell = spells[spellAction.spellId];

    assertIsDefined(spell);

    if (sendTime + spell.features.duration > currentTurn.endTime) {
        console.log('check duration');
        return {
            success: false,
            reason: 'duration'
        };
    }

    return {
        success: true
    };
};
