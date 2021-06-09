import { PlayerCredentials } from '@timeflies/socket-messages';
import { useGameSelector } from '../../store/hooks/use-game-selector';

export const useLoginSelector = <R>(selector: (roomState: PlayerCredentials) => R) => {
    return useGameSelector(state => {
        if (!state.credentials) {
            throw new Error('no credentials state')
        }
        return selector(state.credentials);
    });
};
