import { ServerAction } from "@timeflies/shared";
import { Action } from "redux";
import { ActionListener, ActionListenerObject } from '../action/ActionManager';
import { GameAction } from "../action/game-action/GameAction";
import { Controller } from "../Controller";
import { ReceiveMessageAction } from "../socket/WSClient";

export interface OnAction<RA extends Action> {
    <A extends RA>(type: A[ 'type' ], fn: ActionListener<A>): ActionListenerObject;
}

export interface EventManager {
    onAction: OnAction<GameAction>;
    onMessageAction: OnAction<ServerAction>;
}

export const serviceEvent = (): EventManager => {

    const { actionManager } = Controller;

    const onAction: OnAction<GameAction> = (type, fn) =>
        actionManager.addActionListener(type, fn as ActionListener<GameAction>);

    return {

        onAction,

        onMessageAction<A extends ServerAction>(type, fn) {

            onAction<ReceiveMessageAction<A>>('message/receive', ({ message }) => {
                if (type === message.type) {
                    fn(message);
                }
            });

            return fn;
        }
    };
};
