import { CycleEngineListeners } from '@timeflies/cycle-engine';
import { useSocketListeners } from '@timeflies/socket-client';
import { BattleEndMessage, BattleTurnStartMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { BattlePrepareTurnStartAction, BattleTurnEndAction } from '../store/cycle-actions';
import { useCycleEngine } from '../view/cycle-engine-context';

type ListenersRefValue = {
    onTurnStart: (message: ReturnType<typeof BattleTurnStartMessage>) => void;
    onBattleEnd: () => void;
};

export const useCycleMessageListeners = () => {
    const addSocketListeners = useSocketListeners();
    const dispatch = useDispatch();

    const cycleEngine = useCycleEngine();

    const listenersRef = React.useRef<ListenersRefValue>();
    listenersRef.current = {
        onTurnStart: ({ payload }) => {
            dispatch(BattlePrepareTurnStartAction(payload));
        },
        onBattleEnd: () => cycleEngine.stop()
    };

    useAsyncEffect(() => {
        return addSocketListeners({
            [ BattleTurnStartMessage.action ]: (message: ReturnType<typeof BattleTurnStartMessage>) =>
                listenersRef.current!.onTurnStart(message),
            [ BattleEndMessage.action ]: () => listenersRef.current!.onBattleEnd()
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
