import { logger } from '@timeflies/devtools';
import { Checker } from '../checker';

export const checkChecksum: Checker = ({
    spellAction, newState
}) => {

    if (spellAction.checksum !== newState.checksum) {
        logger.info('Spell check failed: wrong checksum.');
        return false;
    }

    return true;
};
