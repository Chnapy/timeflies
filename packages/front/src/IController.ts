import { GameAction } from "./action/GameAction";
import { Store } from 'redux';
import { UIState } from './ui/UIState';

export interface IController {

    start(): void;
    getStore(): Store<UIState, GameAction>;

    dispatch<A extends GameAction>(action: A): void;
    addEventListener<A extends GameAction>(type: A['type'], fn: (action: A) => void): void

    waitConnect(): Promise<void>;
}
