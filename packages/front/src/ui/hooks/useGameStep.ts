import { GameStateStep, GameState } from '../../game-state';
import { useGameSelector } from './useGameSelector';
import { assertIsNonNullable } from '@timeflies/shared';


export const useGameStep = <S extends Exclude<GameStateStep, 'boot'>, R>(
    step: S,
    fn: (stepData: NonNullable<GameState[ S ]>) => R,
    equalityFn?: (left: R, right: R) => boolean
) => {
    return useGameSelector<R>(state => {

        const stepData = state[ step ];

        assertIsNonNullable(stepData);

        return fn(stepData);
    }, equalityFn);
};
