import * as R from 'redux';
import { GameState } from '../game-state';

declare module 'redux' {

    interface Dispatch<A extends R.Action = R.AnyAction> {
        <T extends A>(action: T): Promise<unknown>
    }

    interface MiddlewareAPI {
        dispatch: Dispatch;
        getState(): GameState;
    }

    interface Middleware {
        (api: MiddlewareAPI): (
            next: Dispatch
        ) => (action: any) => Promise<unknown>;
    }
}
