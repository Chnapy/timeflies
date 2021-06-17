import { useSocketListeners } from '@timeflies/socket-client';
import { BattleNotifyMessage } from '@timeflies/socket-messages';
import { produceStateFromSpellEffect } from '@timeflies/spell-effects';
import React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useFutureEntities } from '../../hooks/use-entities';
import { useDispatchNewState } from './use-dispatch-new-state';

const useOnNotifyMessage = () => {
    const lastState = useFutureEntities(state => state);
    const dispatchNewState = useDispatchNewState();

    return async ({ payload }: ReturnType<typeof BattleNotifyMessage>) => {
        const { spellAction, spellEffect } = payload;

        const futureState = produceStateFromSpellEffect(
            spellEffect,
            lastState,
            spellAction.launchTime
        );

        const { promise } = dispatchNewState(spellEffect, futureState, spellAction);

        await promise;
    };
};

export const useNotifyListener = () => {
    const socketListeners = useSocketListeners();

    const notifyListenerRef = React.useRef<ReturnType<typeof useOnNotifyMessage>>();
    notifyListenerRef.current = useOnNotifyMessage();

    useAsyncEffect(() => {
        return socketListeners({
            [ BattleNotifyMessage.action ]: action => notifyListenerRef.current!(action)
        });
    },
        removeListeners => removeListeners && removeListeners(),
        [ notifyListenerRef ]);
};
