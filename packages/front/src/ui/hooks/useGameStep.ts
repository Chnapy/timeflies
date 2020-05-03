import { GameStateStep, GameState } from '../../game-state';
import { useGameSelector } from './useGameSelector';
import { assertIsNonNullable } from '@timeflies/shared';

interface UseGameStep {
    <S extends Exclude<GameStateStep, 'boot'>, R = NonNullable<GameState[ S ]>>(
        step: S,
        fn: (stepData: NonNullable<GameState[ S ]>) => R
    ): R;
    <S extends Exclude<GameStateStep, 'boot'>>(
        step: S
    ): NonNullable<GameState[ S ]>;
}

export const useGameStep: UseGameStep = <S extends Exclude<GameStateStep, 'boot'>, R = NonNullable<GameState[ S ]>>(
    step: S,
    fn?: (stepData: NonNullable<GameState[ S ]>) => R
) => {
    return useGameSelector(state => {

        const stepData = state[ step ];

        assertIsNonNullable(stepData);

        return fn ? fn(stepData) : stepData;
    });
};
