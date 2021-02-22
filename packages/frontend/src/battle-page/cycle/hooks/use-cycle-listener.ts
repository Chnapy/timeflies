import { useSocketListeners } from '@timeflies/socket-client';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { BattlePrepareTurnStartAction } from '../store/cycle-actions';

type ListenersRefValue = {
    onTurnStart: (message: ReturnType<typeof BattleTurnStartMessage>) => void;
};

export const useCycleListener = () => {
    const addSocketListeners = useSocketListeners();
    const dispatch = useDispatch();

    const listenersRef = React.useRef<ListenersRefValue>();
    listenersRef.current = {
        onTurnStart: ({ payload }) => {
            dispatch(BattlePrepareTurnStartAction(payload));
        }
    };

    useAsyncEffect(() => {
        return addSocketListeners({
            [ BattleTurnStartMessage.action ]: (message: ReturnType<typeof BattleTurnStartMessage>) =>
                listenersRef.current!.onTurnStart(message),
        });
    },
        removeListeners => removeListeners && removeListeners(),
        [ listenersRef ]);
};
