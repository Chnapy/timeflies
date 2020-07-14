import * as R from 'redux';
// import { GameState } from '../game-state';

declare module 'redux' {

    interface Dispatch<A extends R.Action = R.AnyAction> {
        <T extends A>(action: T): Promise<void>
    }

    // export interface Middleware<
    //     DispatchExt = {},
    //     S = string,
    //     D extends R.Dispatch = Dispatch
    //     > extends R.Middleware<{}, number, Dispatch> {
    //         tto: 9
    //     (api): (
    //         next
    //     ) => (action: any) => any;
    // }
}
