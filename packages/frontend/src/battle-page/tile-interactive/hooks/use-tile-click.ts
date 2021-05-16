import { getTimeDiffFromNow, SpellAction, waitCanceleable } from '@timeflies/common';
import { useSocketSendWithResponse } from '@timeflies/socket-client';
import { BattleSpellActionMessage, SocketErrorMessage } from '@timeflies/socket-messages';
import { produceStateFromSpellEffect } from '@timeflies/spell-effects';
import { useDispatch } from 'react-redux';
import { useComputeSpellEffect } from '../../action-preview/hooks/use-compute-spell-effect';
import { BattleCommitAction, BattleRollbackAction, BattleTimeUpdateAction } from '../store/battle-state-actions';

export const useTileClick = () => {
    const computeSpellEffect = useComputeSpellEffect();
    const sendWithResponse = useSocketSendWithResponse();
    const dispatch = useDispatch();

    return async () => {
        // compute again, because time values may have changed
        const spellEffectInfos = await computeSpellEffect();
        if (!spellEffectInfos) {
            return;
        }

        const { spellEffect, spellEffectParams } = spellEffectInfos;
        const futureState = produceStateFromSpellEffect(
            spellEffect,
            spellEffectParams.context.state,
            spellEffectParams.partialSpellAction.launchTime
        );

        const spellAction: SpellAction = {
            ...spellEffectParams.partialSpellAction,
            duration: spellEffect.duration,
            checksum: futureState.checksum
        };

        const request = sendWithResponse(
            BattleSpellActionMessage({ spellAction })
        );

        dispatch(BattleCommitAction({
            spellAction,
            futureState,
            spellEffect
        }));

        const deltaTime = getTimeDiffFromNow(spellAction.launchTime);

        const { promise, cancel } = waitCanceleable(spellAction.duration - deltaTime);

        await Promise.all([
            promise.then(waitInfos => {
                if (waitInfos.state === 'canceled') {
                    return;
                }

                dispatch(BattleTimeUpdateAction({
                    currentTime: futureState.time
                }));
            }),
            request.then(response => {

                if (SocketErrorMessage.match(response)) {
                    // TODO handle error messages
                    return;
                }

                if (!response.payload.success) {
                    cancel();
                    dispatch(BattleRollbackAction({
                        lastState: response.payload.lastState
                    }));
                }
            })
        ]);
    };
};
