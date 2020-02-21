import { Controller } from "./Controller";
import { MockStoreEnhanced } from "redux-mock-store";
import { GameAction } from "./action/GameAction";
import { UIState } from "./ui/UIState";
jest.mock('./Controller');

const { store } = Controller as unknown as { store: MockStoreEnhanced<UIState, GameAction>; };

export const StoreTest = {
    beforeTest(): void {
        store.clearActions();
    },
    afterTest(): void {
        store.clearActions();
    },
    getActions(): GameAction[] {
        return store.getActions();
    }
} as const;