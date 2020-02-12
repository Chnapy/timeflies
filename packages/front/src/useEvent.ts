import { GameAction } from "./action/GameAction";
import { Controller } from "./Controller";

export interface OnAction {
    <A extends GameAction>(type: A['type'], fn: (action: A) => void): (action: A) => void;
}

export interface EventManager {
    onAction: OnAction;
}

export const useEvent = (): EventManager => {

    return {

        onAction(type, fn) {
            Controller.game.forEachScene(scene => {
                scene.events.on(type, fn);
            });
            return fn;
        }
    };
}
