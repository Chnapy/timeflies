import { useSound } from '@timeflies/app-ui';
import { SpellAction } from '@timeflies/common';
import { useSocketSendWithResponse } from '@timeflies/socket-client';
import { BattleSpellActionMessage } from '@timeflies/socket-messages';
import { produceStateFromSpellEffect } from '@timeflies/spell-effects';
import { useDispatch } from 'react-redux';
import { useDispatchMessageErrorIfAny } from '../../../error-list/hooks/use-dispatch-error-if-any';
import { useComputeSpellEffect } from '../../action-preview/hooks/use-compute-spell-effect';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { BattleRollbackAction } from '../../tile-interactive/store/battle-state-actions';
import { useDispatchNewState } from './use-dispatch-new-state';

export const useLaunchSpellAction = () => {
    const playSound = useSound();
    const computeSpellEffect = useComputeSpellEffect();
    const sendWithResponse = useSocketSendWithResponse();
    const dispatch = useDispatch();
    const dispatchMessageErrorIfAny = useDispatchMessageErrorIfAny();
    const dispatchNewState = useDispatchNewState();
    const turnStartTime = useBattleSelector(battle => battle.turnStartTime);

    return async () => {
        if (turnStartTime > Date.now()) {
            playSound('spellLaunchDenied');
            return;
        }

        // compute again, because time values may have changed
        const spellEffectInfos = await computeSpellEffect();
        if (!spellEffectInfos) {
            playSound('spellLaunchDenied');
            return;
        }

        playSound('spellLaunch');

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

                if (dispatchMessageErrorIfAny(response)) {
                    return;
                }

                if (!response.payload.success) {
                    cancel();

                    playSound('spellLaunchInterrupt');

                    dispatch(BattleRollbackAction({
                        lastState: response.payload.lastState
                    }));
                }
            })
        ]);
    };
};
