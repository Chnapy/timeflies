import { GameAction } from "../action/GameAction";
import { IController } from "../IController";
import { StoreTest } from '../StoreTest';

export const Controller: IController = {

    start() { },

    getStore() {
        return StoreTest.getStore();
    },

    waitConnect() {
        return Promise.resolve();
    },

    dispatch<A extends GameAction>(action: A): void {
        StoreTest.getStore().dispatch(action);
    },

    addEventListener<A extends GameAction>(type, fn) {
        StoreTest.getStore().subscribe(() => {
            const actions = StoreTest.getStore().getActions();
            const lastAction: GameAction | A | undefined = actions[actions.length - 1];
            if (lastAction?.type === type) {
                fn(lastAction);
            }
        });
    }
};
