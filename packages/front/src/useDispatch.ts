import { GameAction } from "./action/GameAction";
import { Controller } from "./Controller";

type Params = {
    [K in string]: (...args) => GameAction;
};

export const useDispatch = <P extends Params>(map: P): P => {
    return Object.entries(map)
        .reduce((arr, [key, value]) => {

            arr[key] = (...args) => Controller.dispatch(value(...args));

            return arr;
        }, {}) as P;
};
