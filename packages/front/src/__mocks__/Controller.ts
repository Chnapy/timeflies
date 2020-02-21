import { GameAction } from "../action/GameAction";

export class Controller {

    static onDispatch: (action: GameAction) => void = action => console.log(action);

    static readonly dispatch = <A extends GameAction>(action: A): void => {
        Controller.onDispatch(action);
    };
}