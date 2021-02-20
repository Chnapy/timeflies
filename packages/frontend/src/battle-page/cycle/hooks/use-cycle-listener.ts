import { useSocketListeners } from '@timeflies/socket-client';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import { useDispatch } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { BattlePrepareTurnStartAction } from '../store/cycle-actions';

export const useCycleListener = () => {
    const addSocketListeners = useSocketListeners();
    const dispatch = useDispatch();

    useAsyncEffect(() => {
        return addSocketListeners({
            [ BattleTurnStartMessage.action ]: ({ payload }: ReturnType<typeof BattleTurnStartMessage>) => {
                dispatch(BattlePrepareTurnStartAction(payload));
            }
        });
    },
        removeListeners => removeListeners && removeListeners(),
        []);
};
