import { useSocketListeners } from '@timeflies/socket-client';
import { BattleNotifyMessage } from '@timeflies/socket-messages';
import { produceStateFromSpellEffect } from '@timeflies/spell-effects';
import React from 'react';
import { useDispatch } from 'react-redux';
import { batchActions } from 'redux-batched-actions';
import { useAsyncEffect } from 'use-async-effect';
import { useFutureEntities } from '../../hooks/use-entities';
import { useDispatchNewState } from './use-dispatch-new-state';

const useOnNotifyMessage = () => {
    const firstLastState = useFutureEntities(state => state);
    const dispatch = useDispatch();
    const dispatchNewState = useDispatchNewState();

    return async (messageList: ReturnType<typeof BattleNotifyMessage>[]) => {
        let lastState = firstLastState;

        const actionAndPromiseList = messageList.map(({ payload }) => {
            const { spellAction, spellEffect } = payload;

            const futureState = produceStateFromSpellEffect(
                spellEffect,
                lastState,
                spellAction.launchTime
            );
            lastState = futureState;

            const { commitAction, promise } = dispatchNewState(spellEffect, futureState, spellAction, {
                ignoreCommitDispatch: true
            });

            return { promise, commitAction };
        });

        dispatch(batchActions(
            actionAndPromiseList.map(({ commitAction }) => commitAction)
        ));

        await Promise.all(actionAndPromiseList.map(({ promise }) => promise));
    };
};

export const useNotifyListener = () => {
    const socketListeners = useSocketListeners();

    const notifyListenerRef = React.useRef<ReturnType<typeof useOnNotifyMessage>>();
    notifyListenerRef.current = useOnNotifyMessage();

    useAsyncEffect(() => {
        return socketListeners({}, {
            [ BattleNotifyMessage.action ]: messageList => notifyListenerRef.current!(messageList)
        });
    },
        removeListeners => removeListeners && removeListeners(),
        [ notifyListenerRef ]);
};
