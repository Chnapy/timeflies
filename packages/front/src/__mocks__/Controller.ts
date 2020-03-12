import configureStore from 'redux-mock-store';
import { GameAction } from "../action/GameAction";
import { IController } from "../IController";
import { UIState } from "../ui/UIState";

const mockStore = configureStore<UIState, GameAction>();

const store = mockStore();

export interface Controller extends IController {
    store: typeof store;
}

export const Controller: Controller = {

    store,

    start() { },

    waitConnect() {
        return Promise.resolve();
    },

    dispatch<A extends GameAction>(action: A): void {
        store.dispatch(action);
        // throw new Error(action.type + ' ' + store.getActions().length);
    },

    addEventListener<A extends GameAction>(type, fn) {
        store.subscribe(() => {
            const actions = store.getActions();
            const lastAction: GameAction | A | undefined = actions[actions.length - 1];
            if (lastAction?.type === type) {
                fn(lastAction);
            }
        });
    }
};
