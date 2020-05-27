import { Action } from '@reduxjs/toolkit';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import { GameState } from "./game-state";
jest.mock('./Controller');

if (process.env.NODE_ENV !== 'test') {
    throw new Error(`StoreTest should be used only in 'test' env, but you're in '${process.env.NODE_ENV}' env.`);
}

const mockStore = configureStore<GameState, Action>();

let store: MockStoreEnhanced<GameState, Action>;

const initStore = (state?: Partial<GameState>): void => {
    store = mockStore({
        currentPlayer: null,
        battle: null,
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
    getActions(): Action[] {
        return store.getActions();
    },
    clearActions(): void {
        store.clearActions();
    },
    dispatch(action: Action): void {
        store.dispatch(action);
    }
} as const;