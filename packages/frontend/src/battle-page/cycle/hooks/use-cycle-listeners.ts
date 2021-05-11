import { CycleEngineListeners } from '@timeflies/cycle-engine';
import { useSocketListeners } from '@timeflies/socket-client';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { BattlePrepareTurnStartAction, BattleTurnEndAction } from '../store/cycle-actions';

type ListenersRefValue = {
    onTurnStart: (message: ReturnType<typeof BattleTurnStartMessage>) => void;
};

export const useCycleMessageListeners = () => {
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

export const useCycleEngineListeners = () => {
    const dispatch = useDispatch();

    return (): CycleEngineListeners => ({
        turnEnd: () => {
            dispatch(BattleTurnEndAction());
        }
    });
};
