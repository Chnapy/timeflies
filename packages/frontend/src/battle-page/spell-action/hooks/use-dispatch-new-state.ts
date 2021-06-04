import { getTimeDiffFromNow, SerializableState, SpellAction, waitCanceleable } from '@timeflies/common';
import { SpellEffect } from '@timeflies/spell-effects';
import { useDispatch } from 'react-redux';
import { BattleCommitAction, BattleTimeUpdateAction } from '../../tile-interactive/store/battle-state-actions';

export const useDispatchNewState = () => {
    const dispatch = useDispatch();

    return (spellEffect: SpellEffect, futureState: SerializableState, spellAction: SpellAction) => {

        dispatch(BattleCommitAction({
            spellAction,
            futureState,
            spellEffect
        }));

        const deltaTime = getTimeDiffFromNow(spellAction.launchTime);

        const { promise, cancel } = waitCanceleable(spellAction.duration - deltaTime);

        return {
            promise: promise.then(waitInfos => {
                if (waitInfos.state === 'canceled') {
                    return;
                }

                dispatch(BattleTimeUpdateAction({
                    currentTime: futureState.time
                }));
            }),
            cancel
        };
    };
};
