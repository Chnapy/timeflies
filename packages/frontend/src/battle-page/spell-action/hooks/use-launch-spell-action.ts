import { SpellAction } from '@timeflies/common';
import { useSocketSendWithResponse } from '@timeflies/socket-client';
import { BattleSpellActionMessage, SocketErrorMessage } from '@timeflies/socket-messages';
import { produceStateFromSpellEffect } from '@timeflies/spell-effects';
import { useDispatch } from 'react-redux';
import { useComputeSpellEffect } from '../../action-preview/hooks/use-compute-spell-effect';
import { BattleRollbackAction } from '../../tile-interactive/store/battle-state-actions';
import { useDispatchNewState } from './use-dispatch-new-state';

export const useLaunchSpellAction = () => {
    const computeSpellEffect = useComputeSpellEffect();
    const sendWithResponse = useSocketSendWithResponse();
    const dispatch = useDispatch();
    const dispatchNewState = useDispatchNewState();

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

        const { promise, cancel } = dispatchNewState(spellEffect, futureState, spellAction);

        await Promise.all([
            promise,
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
