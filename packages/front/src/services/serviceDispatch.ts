import { GameAction } from "../action/GameAction";
import { Controller } from "../Controller";
import { SendMessageAction } from "../socket/WSClient";

type Params = {
    [ K in string ]: (...args) => Exclude<GameAction, SendMessageAction>;
};

export const serviceDispatch = <P extends Params>(map: P): P => {

    const { actionManager } = Controller;

    return Object.entries(map)
        .reduce((arr, [ key, value ]) => {

            arr[ key ] = (...args) => actionManager.dispatch(value(...args));

            return arr;
        }, {}) as P;
};
