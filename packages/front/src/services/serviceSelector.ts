import { Controller } from '../Controller';
import { UIState } from '../ui/UIState';

export const serviceSelector = <R>(
    fn: (state: UIState) => R
): R => {
    const state = Controller.getStore().getState();
    return fn(state);
};
