import { GameAction } from "./action/GameAction";

export interface IController {

    start(): void;
    dispatch<A extends GameAction>(action: A): void;
    addEventListener<A extends GameAction>(type: A['type'], fn: (action: A) => void): void

    waitConnect(): Promise<void>;
}
