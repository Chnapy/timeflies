import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import { GameAction } from "./action/GameAction";
import { GameState } from "./game-state";
jest.mock('./Controller');

if (process.env.NODE_ENV !== 'test') {
    throw new Error(`StoreTest should be used only in 'test' env, but you're in '${process.env.NODE_ENV}' env.`);
}

const mockStore = configureStore<GameState, GameAction>();

let store: MockStoreEnhanced<GameState, GameAction>;

const initStore = (state?: Partial<GameState>): void => {
    store = mockStore({
        currentPlayer: null,
        battle: null,
        load: null,
        room: null,
        step: 'battle',
        ...state
    });
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