import { AnyAction, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { Normalized, SpellRole, WaitTimeoutPromise } from '@timeflies/shared';
import { BattleState } from '../../../ui/reducers/battle-reducers/battle-reducer';
import { waitTimeoutPool } from '../../../wait-timeout-pool';
import { getTurnRemainingTime } from '../cycle/cycle-reducer';
import { spellEngineDefault } from '../engine/spellEngine/default/spell-engine-default';
import { SpellEngine, SpellEngineDependencies, spellEngineMap } from '../engine/spellEngine/spell-engine';
import { Spell } from '../entities/spell/Spell';
import { SpellActionLaunchAction } from '../spellAction/spell-action-actions';
import { BattleStateSpellPrepareAction, BattleStateTurnStartAction } from './battle-state-actions';

type Dependencies<S> = SpellEngineDependencies<S> & {
    getSpellEngineFromType?: (spellRole: SpellRole, api: MiddlewareAPI, deps: SpellEngineDependencies<S>) => SpellEngine;
    extractBattleState: (getState: () => S) => BattleState;
    extractFutureSpells: (getState: () => S) => Normalized<Spell<'future'>>;
};

const defaultGetSpellEngineFromType: Dependencies<any>['getSpellEngineFromType'] = (spellRole, api, deps) => {
    const spellEngineCreator = spellEngineMap[spellRole] ?? spellEngineDefault;

    return spellEngineCreator(deps)(api);
};

export const battleActionMiddleware: <S>(deps: Dependencies<S>) => Middleware = ({
    getSpellEngineFromType = defaultGetSpellEngineFromType,
    extractBattleState,
    extractFutureSpells,
    ...deps
}) => api => next => {
    const { extractState, extractFutureSpell, extractFutureCharacter } = deps;

    /**
     * Remove selected spell when there is no enough time left to launch it
     */
    const updateSpellTimeout = (spell?: Spell<'future'>) => {

        if (spellEnableTimeout) {
            spellEnableTimeout.cancel();
        }

        if (!spell) {
            return;
        }

        const currentTimeRemaining = getTurnRemainingTime(extractBattleState(api.getState), 'current');
        const futureTimeRemaining = getTurnRemainingTime(extractBattleState(api.getState), 'future');

        const timeoutDuration = futureTimeRemaining - spell.features.duration > 0
            // if spell can be launched again, we can wait until it cannot
            ? currentTimeRemaining - spell.features.duration
            // else spell should be disabled now
            : 0;

        const futureCharacter = extractFutureCharacter(api.getState);

        const fn = () => {
            const nextFutureCharacter = extractFutureCharacter(api.getState);

            const nextFutureSpell = extractFutureSpell(api.getState);

            if (nextFutureCharacter
                && nextFutureCharacter.id === futureCharacter?.id
                && nextFutureSpell?.id === spell.id
            ) {
                // console.log('cancel spell');
                // console.table({
                //     spellId: spell.id,
                //     spellRole: spell.staticData.role,
                //     timeoutDuration,
                //     spellDuration: spell.features.duration
                // });

                return api.dispatch(BattleStateSpellPrepareAction({
                    futureSpell: null,
                    futureCharacter
                }));
            }
        };

        spellEnableTimeout = waitTimeoutPool.createTimeout(timeoutDuration)
            .onCompleted(fn);
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

        // console.log('B-A middleware')
        // console.table({
        //     prevCurrentAction: prevState.currentAction,
        //     nextCurrentAction: nextState.currentAction,
        //     prevSpellId: nextSpell?.id,
        //     nextSpellId: nextSpell?.id,
        // })

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

        if (BattleStateTurnStartAction.match(action)) {

            const futureCharacter = extractFutureCharacter(api.getState)!;
            const futureSpell = extractFutureSpells(api.getState)[futureCharacter.defaultSpellId];

            await api.dispatch(BattleStateSpellPrepareAction({
                futureCharacter,
                futureSpell
            }));
        }

        // spellEnableTimeout is not waited since it does not represent middleware process time

        return ret;
    };
};
