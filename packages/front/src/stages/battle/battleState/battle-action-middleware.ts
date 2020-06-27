import { AnyAction, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { SpellType } from '@timeflies/shared';
import { SpellEngine, SpellEngineDependencies, spellEngineMap } from '../engine/spellEngine/spell-engine';
import { SpellActionLaunchAction } from '../spellAction/spell-action-actions';
import { BattleStateSpellPrepareAction } from './battle-state-actions';
import { Spell } from '../entities/spell/Spell';
import { getTurnRemainingTime } from '../cycle/cycle-reducer';
import { BattleState } from '../../../ui/reducers/battle-reducers/battle-reducer';

type Dependencies<S> = SpellEngineDependencies<S> & {
    getSpellEngineFromType?: (spellType: SpellType, api: MiddlewareAPI, deps: SpellEngineDependencies<S>) => SpellEngine;
    extractBattleState: (getState: () => S) => BattleState;
};

const defaultGetSpellEngineFromType: Dependencies<any>[ 'getSpellEngineFromType' ] = (spellType, api, deps) => {
    const spellEngineCreator = spellEngineMap[ spellType ];

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
            clearTimeout(spellEnableTimeout);
        }

        if (!spell) {
            return;
        }

        const timeoutDuration = getTurnRemainingTime(extractBattleState(api.getState), 'future') - spell.feature.duration;

        const futureCharacter = extractFutureCharacter(api.getState);

        const fn = () => {
            spellEnableTimeout = null;

            const nextFutureCharacter = extractFutureCharacter(api.getState);

            if (nextFutureCharacter && nextFutureCharacter.id === futureCharacter?.id) {
                api.dispatch(BattleStateSpellPrepareAction({
                    futureSpell: null,
                    futureCharacter
                }));
            }
        };

        spellEnableTimeout = setTimeout(fn, timeoutDuration);
    };

    const getSpellEngine = (): SpellEngine => {
        const state = extractState(api.getState);

        if (state.currentAction === 'spellPrepare') {
            const spell = extractFutureSpell(api.getState);

            updateSpellTimeout(spell);

            if (spell)
                return getSpellEngineFromType(spell.staticData.type, api, deps);
        }

        return async () => { };
    };

    let spellEnableTimeout: NodeJS.Timeout | null = null;
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

                if (nextSpell)
                    api.dispatch(BattleStateSpellPrepareAction({
                        futureSpell: nextSpell!,
                        futureCharacter: extractFutureCharacter(api.getState)!
                    }));
            }
        }

        return ret;
    };
};
