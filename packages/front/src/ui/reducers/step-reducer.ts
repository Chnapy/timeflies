import { createReducer } from '@reduxjs/toolkit';
import { GameStateStep } from '../../game-state';
import { StageChangeAction } from '../../stages/stage-actions';

export const stepReducer = createReducer('boot' as GameStateStep, {
    [ StageChangeAction.type ]: (state, { payload }: StageChangeAction) => payload.stageKey
});
