import { AnyAction } from '@reduxjs/toolkit';
import { BattleStateSpellPrepareAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { getDefaultIsPositionTargetable, getOnSpellPrepare, getOnTileClick, getOnTileHover } from '../default/spell-engine-default-fns';
import { SpellEngineCreator } from '../spell-engine';

export const spellEngineSwitch: SpellEngineCreator = deps => api => {

    const onSpellPrepare = getOnSpellPrepare(deps, api, {
        getIsPositionTargetable: fnDeps => {
            const defaultFn = getDefaultIsPositionTargetable(fnDeps);

            const { futureCharacterPosition } = fnDeps;

            return bresenhamPoint => {
                const { position } = bresenhamPoint;

                const dx = Math.abs(futureCharacterPosition.x - position.x);
                const dy = Math.abs(futureCharacterPosition.y - position.y);
                if (dx !== dy) {
                    return 'no';
                }

                return defaultFn(bresenhamPoint);
            };
        }
    });

    const onTileHover = getOnTileHover(deps, api);

    const onTileClick = getOnTileClick(deps, api);

    return async (action: AnyAction) => {

        if (TileHoverAction.match(action)) {
            await onTileHover(action);

        } else if (TileClickAction.match(action)) {
            await onTileClick(action);

        } else if (BattleStateSpellPrepareAction.match(action)) {
            await onSpellPrepare(action);

        }
    };
};
