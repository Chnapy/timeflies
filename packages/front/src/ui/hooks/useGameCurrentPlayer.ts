import { assertIsNonNullable } from '@timeflies/shared';
import { GameState } from '../../game-state';
import { useGameSelector } from './useGameSelector';

export const useGameCurrentPlayer = <R>(
    fn: (currentPlayer: NonNullable<GameState[ 'currentPlayer' ]>) => R
) => useGameSelector(({ currentPlayer }) => {

    assertIsNonNullable(currentPlayer);

    return fn(currentPlayer);
});
