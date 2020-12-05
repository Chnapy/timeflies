import { Checker } from '../checker';

export const checkChecksum: Checker = ({
    spellAction, newState
}) => {
    return spellAction.checksum === newState.checksum;
};
