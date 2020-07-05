import { AnyAction } from '@reduxjs/toolkit';
import { BattleStateSpellPrepareAction, TileClickAction, TileHoverAction } from '../../../battleState/battle-state-actions';
import { SpellEngineCreator } from '../spell-engine';
import { getOnSpellPrepare, getOnTileClick, getOnTileHover } from './spell-engine-default-fns';

export const spellEngineDefault: SpellEngineCreator = deps => api => {

    const onSpellPrepare = getOnSpellPrepare(deps, api);

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
