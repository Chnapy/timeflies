import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import { GameAction } from "./action/GameAction";
import { UIState } from "./ui/UIState";
jest.mock('./Controller');

const mockStore = configureStore<UIState, GameAction>();

let store: MockStoreEnhanced<UIState, GameAction>;

const initStore = <S extends UIState>(state?: S) => {
    store = mockStore(state);
}

initStore();

export const StoreTest = {
    beforeTest(): void {
        store.clearActions();
        initStore();
    },
    afterTest(): void {
        store.clearActions();
        initStore();
    },
    initStore,
    getStore() {
        return store;
    },
    getActions(): GameAction[] {
        return store.getActions();
    },
    clearActions(): void {
        store.clearActions();
    },
    dispatch<A extends GameAction>(action: A): void {
        store.dispatch(action);
    }
} as const;