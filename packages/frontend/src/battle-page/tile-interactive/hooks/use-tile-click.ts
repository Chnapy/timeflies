import { getTimeDiffFromNow, SpellAction, waitCanceleable } from '@timeflies/common';
import { useSocketSendWithResponse } from '@timeflies/socket-client';
import { BattleSpellActionMessage, SocketErrorMessage } from '@timeflies/socket-messages';
import { produceStateFromSpellEffect } from '@timeflies/spell-effects';
import { useDispatch } from 'react-redux';
import { useComputeSpellEffect } from '../../action-preview/hooks/use-compute-spell-effect';
import { useActionPreviewContext } from '../../action-preview/view/action-preview-context';
import { BattleCommitAction, BattleRollbackAction, BattleTimeUpdateAction } from '../store/battle-state-actions';

export const useTileClick = () => {
    const actionPreviewProps = useActionPreviewContext();
    const computeSpellEffect = useComputeSpellEffect(actionPreviewProps);
    const sendWithResponse = useSocketSendWithResponse();
    const dispatch = useDispatch();

    return async () => {
        // compute again, because time values may have changed
        const spellEffectInfos = computeSpellEffect();
        if (!spellEffectInfos) {
            return;
        }

        const { spellEffect, spellEffectParams } = spellEffectInfos;
        const futureState = produceStateFromSpellEffect(spellEffect, spellEffectParams);

        const spellAction: SpellAction = {
            ...spellEffectParams.spellAction,
            checksum: futureState.checksum
        };

        const request = sendWithResponse(
            BattleSpellActionMessage({ spellAction })
        );

        dispatch(BattleCommitAction({
            spellAction,
            futureState
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
