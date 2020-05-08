import { GameAction } from "../action/game-action/GameAction";
import { Controller } from "../Controller";
import { SendMessageAction } from "../socket/WSClient";

type Params = {
    [ K in string ]: (...args) => Exclude<GameAction, SendMessageAction>;
};

export const serviceDispatch = <P extends Params>(map: P): P => {

    const { dispatch } = Controller.getStore();

    return Object.entries(map)
        .reduce((arr, [ key, value ]) => {

            arr[ key ] = (...args) => dispatch(value(...args));

            return arr;
        }, {}) as P;
};
