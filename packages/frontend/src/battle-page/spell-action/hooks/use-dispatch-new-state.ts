import { getTimeDiffFromNow, SerializableState, SpellAction, waitCanceleable } from '@timeflies/common';
import { SpellEffect } from '@timeflies/spell-effects';
import { useDispatch } from 'react-redux';
import { BattleCommitAction, BattleTimeUpdateAction } from '../../tile-interactive/store/battle-state-actions';

type DispatchNewStateOptions = {
    ignoreCommitDispatch?: boolean;
};

export const useDispatchNewState = () => {
    const dispatch = useDispatch();

    return (spellEffect: SpellEffect, futureState: SerializableState, spellAction: SpellAction, { ignoreCommitDispatch }: DispatchNewStateOptions = {}) => {

        const commitAction = BattleCommitAction({
            spellAction,
            futureState,
            spellEffect
        });

        if (!ignoreCommitDispatch) {
            dispatch(commitAction);
        }

        const deltaTime = getTimeDiffFromNow(spellAction.launchTime);

        const { promise, cancel } = waitCanceleable(spellAction.duration - deltaTime);

        return {
            commitAction,
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
