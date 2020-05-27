import { PayloadActionCreator } from '@reduxjs/toolkit';
import { ServerAction } from "@timeflies/shared";
import { PayloadActionListener, ActionListenerObject } from '../action/ActionManager';
import { Controller } from "../Controller";
import { ReceiveMessageAction } from "../socket/wsclient-actions";

export type OnAction = {
    <AC extends PayloadActionCreator<any>>(actionCreator: AC, fn: PayloadActionListener<ReturnType<AC>[ 'payload' ]>): ActionListenerObject;
};

export const serviceEvent = () => {

    const { actionManager } = Controller;

    const onAction: OnAction = (actionCreator, fn) =>
        actionManager.addActionListener(actionCreator.type, fn as any);

    return {

        onAction,

        onMessageAction<A extends ServerAction>(type: A[ 'type' ], fn: PayloadActionListener<A>) {

            onAction(ReceiveMessageAction, payload => {
                if (type === payload.type) {
                    fn(payload as A);
                }
            });

            return fn;
        }
    };
};
