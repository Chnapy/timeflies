import { AnyAction, Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { SpellType } from '@timeflies/shared';
import { SpellEngine, SpellEngineDependencies, spellEngineMap } from '../engine/spellEngine/spell-engine';

type Dependencies<S> = SpellEngineDependencies<S> & {
    getSpellEngineFromType?: (spellType: SpellType, api: MiddlewareAPI) => SpellEngine;
};

const defaultGetSpellEngineFromType = <S>(spellType: SpellType, api: MiddlewareAPI, deps: SpellEngineDependencies<S>) => {
    const spellEngineCreator = spellEngineMap[ spellType ];

    return spellEngineCreator(deps)(api);
};

export const battleActionMiddleware: <S>(deps: Dependencies<S>) => Middleware = ({
    getSpellEngineFromType = defaultGetSpellEngineFromType,
    ...deps
}) => api => next => {
    const { extractState, extractFutureSpell } = deps;

    const getSpellEngine = (): SpellEngine => {
        const state = extractState(api.getState);

        if (state.currentAction === 'spellPrepare') {
            const spell = extractFutureSpell(api.getState)!;
            
            return getSpellEngineFromType(spell.staticData.type, api, deps);
        }

        return () => { };
    };

    let spellEngine = getSpellEngine();

    return (action: AnyAction) => {

        const prevState = extractState(api.getState);
        const prevSpell = extractFutureSpell(api.getState);

        next(action);

        const nextState = extractState(api.getState);
        const nextSpell = extractFutureSpell(api.getState);

        if (prevState.currentAction !== nextState.currentAction
            || prevSpell?.id !== nextSpell?.id) {

            spellEngine = getSpellEngine();
        }

        spellEngine(action);
    };
};
