import { Controller } from '../Controller';
import { GameState } from '../game-state';

export const serviceSelector = <R>(
    fn: (state: GameState) => R
): R => {
    const state = Controller.getStore().getState();
    return fn(state);
};
