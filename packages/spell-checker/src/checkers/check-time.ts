import { logger } from '@timeflies/devtools';
import { Checker } from '../checker';

export const checkTime: Checker = ({ spellAction, context }) => {
    const { currentTurn, state } = context;

    if (spellAction.launchTime < currentTurn.startTime) {
        logger.info('Spell check failed: spell action starts before turn start.');
        return false;
    }

    const turnDuration = state.characters.actionTime[ currentTurn.characterId ];
    const turnEndTime = currentTurn.startTime + turnDuration;

    if (spellAction.launchTime + spellAction.duration > turnEndTime) {
        logger.info('Spell check failed: spell action ends after turn end.');
        return false;
    }

    return true;
};
