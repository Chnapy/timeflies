import { GameState } from '../../game-state';
import { useGameSelector } from './useGameSelector';

export const useGameCurrentPlayer = <R>(
    fn: (currentPlayer: GameState[ 'auth' ]) => R
) => useGameSelector(({ auth }) => {

    return fn(auth);
});
