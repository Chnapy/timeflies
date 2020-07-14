import { AnyAction, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { SpellRole, WaitTimeoutPromise } from '@timeflies/shared';
import { SpellEngine, SpellEngineDependencies, spellEngineMap } from '../engine/spellEngine/spell-engine';
import { SpellActionLaunchAction } from '../spellAction/spell-action-actions';
import { BattleStateSpellPrepareAction } from './battle-state-actions';
import { Spell } from '../entities/spell/Spell';
import { getTurnRemainingTime } from '../cycle/cycle-reducer';
import { BattleState } from '../../../ui/reducers/battle-reducers/battle-reducer';
import { spellEngineDefault } from '../engine/spellEngine/default/spell-engine-default';
import { waitTimeoutPool } from '../../../wait-timeout-pool';

type Dependencies<S> = SpellEngineDependencies<S> & {
    getSpellEngineFromType?: (spellRole: SpellRole, api: MiddlewareAPI, deps: SpellEngineDependencies<S>) => SpellEngine;
    extractBattleState: (getState: () => S) => BattleState;
};

const defaultGetSpellEngineFromType: Dependencies<any>[ 'getSpellEngineFromType' ] = (spellRole, api, deps) => {
    const spellEngineCreator = spellEngineMap[ spellRole ] ?? spellEngineDefault;

    return spellEngineCreator(deps)(api);
};

export const battleActionMiddleware: <S>(deps: Dependencies<S>) => Middleware = ({
    getSpellEngineFromType = defaultGetSpellEngineFromType,
    extractBattleState,
    ...deps
}) => api => next => {
    const { extractState, extractFutureSpell, extractFutureCharacter } = deps;

    const updateSpellTimeout = (spell?: Spell<'future'>) => {

        if (spellEnableTimeout) {
            spellEnableTimeout.cancel();
        }

        if (!spell) {
            return;
        }

        const timeoutDuration = getTurnRemainingTime(extractBattleState(api.getState), 'future') - spell.features.duration;

        const futureCharacter = extractFutureCharacter(api.getState);

        const fn = () => {
            const nextFutureCharacter = extractFutureCharacter(api.getState);

            if (nextFutureCharacter && nextFutureCharacter.id === futureCharacter?.id) {
                return api.dispatch(BattleStateSpellPrepareAction({
                    futureSpell: null,
                    futureCharacter
                }));
            }
        };

        spellEnableTimeout = waitTimeoutPool.createTimeout(timeoutDuration)
            .then(state => {
                if (state === 'completed')
                    return fn();
            });
    };

    const getSpellEngine = (): SpellEngine => {
        const state = extractState(api.getState);

        if (state.currentAction === 'spellPrepare') {
            const spell = extractFutureSpell(api.getState);

            updateSpellTimeout(spell);

            if (spell)
                return getSpellEngineFromType(spell.staticData.role, api, deps);
        }

        return async () => { };
    };

    let spellEnableTimeout: WaitTimeoutPromise<void> | null = null;
    let spellEngine = getSpellEngine();

    return async (action: AnyAction) => {

        const prevState = extractState(api.getState);
        const prevSpell = extractFutureSpell(api.getState);

        const ret = next(action);

        const nextState = extractState(api.getState);
        const nextSpell = extractFutureSpell(api.getState);

        if (prevState.currentAction !== nextState.currentAction
            || prevSpell?.id !== nextSpell?.id) {

            spellEngine = getSpellEngine();
        }

        await spellEngine(action);

        if (nextState.currentAction === 'spellPrepare') {
            if (SpellActionLaunchAction.match(action)) {

                updateSpellTimeout(nextSpell);

                if (nextSpell) {
                    await api.dispatch(BattleStateSpellPrepareAction({
                        futureSpell: nextSpell!,
                        futureCharacter: extractFutureCharacter(api.getState)!
                    }));
                }
            }
        }

        if (spellEnableTimeout) {
            await spellEnableTimeout;
        }

        return ret;
    };
};
