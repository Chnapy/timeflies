import { GameAction } from "./action/GameAction";

export interface IController {

    start(): void;
    dispatch<A extends GameAction>(action: A): void;

    waitConnect(): Promise<void>;
}
