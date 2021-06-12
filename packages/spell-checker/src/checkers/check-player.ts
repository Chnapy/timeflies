import { logger } from '@timeflies/devtools';
import { Checker } from '../checker';

export const checkPlayer: Checker = ({
    context
}) => {
    const { clientContext, currentTurn } = context;

    if (clientContext.playerId !== currentTurn.playerId) {
        logger.info('Spell check failed: wrong player id.');
        return false;
    }

    return true;
};
