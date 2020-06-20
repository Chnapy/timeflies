import { AnyAction, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { SpellType } from '@timeflies/shared';
import { SpellEngine, SpellEngineDependencies, spellEngineMap } from '../engine/spellEngine/spell-engine';
import { SpellActionLaunchAction } from '../spellAction/spell-action-actions';
import { BattleStateSpellPrepareAction } from './battle-state-actions';

type Dependencies<S> = SpellEngineDependencies<S> & {
    getSpellEngineFromType?: (spellType: SpellType, api: MiddlewareAPI, deps: SpellEngineDependencies<S>) => SpellEngine;
};

const defaultGetSpellEngineFromType: Dependencies<any>[ 'getSpellEngineFromType' ] = (spellType, api, deps) => {
    const spellEngineCreator = spellEngineMap[ spellType ];

    return spellEngineCreator(deps)(api);
};

export const battleActionMiddleware: <S>(deps: Dependencies<S>) => Middleware = ({
    getSpellEngineFromType = defaultGetSpellEngineFromType,
    ...deps
}) => api => next => {
    const { extractState, extractFutureSpell, extractFutureCharacter } = deps;

    const getSpellEngine = (): SpellEngine => {
        const state = extractState(api.getState);

        if (state.currentAction === 'spellPrepare') {
            const spell = extractFutureSpell(api.getState)!;

            return getSpellEngineFromType(spell.staticData.type, api, deps);
        }

        return async () => { };
    };

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
                api.dispatch(BattleStateSpellPrepareAction({
                    futureSpell: nextSpell!,
                    futureCharacter: extractFutureCharacter(api.getState)!
                }));
            }
        }

        return ret;
    };
};
