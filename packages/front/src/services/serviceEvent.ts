import { GameAction } from "../action/GameAction";
import { Controller } from "../Controller";
import { ReceiveMessageAction } from "../socket/WSClient";
import { ServerAction } from "@timeflies/shared";
import { Action } from "redux";

export interface OnAction<RA extends Action> {
    <A extends RA>(type: A['type'], fn: (action: A) => void): (action: A) => void;
}

export interface EventManager {
    onAction: OnAction<GameAction>;
    onMessageAction: OnAction<ServerAction>;
}

export const serviceEvent = (): EventManager => {

    const onAction: OnAction<GameAction> = (type, fn) => {
        Controller.game.forEachScene(scene => {
            scene.events.on(type, fn);
        });
        return fn;
    };

    return {

        onAction,

        onMessageAction<A extends ServerAction>(type, fn) {

            onAction<ReceiveMessageAction<A>>('message/receive', ({ message }) => fn(message));

            return fn;
        }
    };
};
