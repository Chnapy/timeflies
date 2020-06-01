import { createReducer } from '@reduxjs/toolkit';
import { BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { BattleStartAction } from '../battle-actions';

export type TurnState = 'idle' | 'running' | 'ended';

export type CycleState = {
    globalTurnId: number;
    globalTurnOrder: string[];  // character id sorted list
    globalTurnStartTime: number;
    turnId: number;
    currentCharacterId: string;
    turnStartTime: number;
    turnDuration: number;
};

const initialState: CycleState = {
    globalTurnId: -1,
    globalTurnOrder: [],
    globalTurnStartTime: -1,
    turnId: -1,
    currentCharacterId: '',
    turnStartTime: -1,
    turnDuration: -1
};

export const getTurnState = ({ turnStartTime, turnDuration }: Pick<CycleState, 'turnStartTime' | 'turnDuration'>): TurnState => {
    const now = Date.now();

    if (now < turnStartTime) {
        return 'idle';
    }

    if (now < turnStartTime + turnDuration) {
        return 'running';
    }
    
    return 'ended';
};

export const cycleReducer = createReducer(initialState, {

    [ BattleStartAction.type ]: (state, { payload }: BattleStartAction) => {
        const { id, order, startTime, currentTurn: {
            id: turnId, characterId, startTime: turnStartTime, duration
        } } = payload.globalTurnSnapshot;

        return {
            globalTurnId: id,
            globalTurnOrder: order,
            globalTurnStartTime: startTime,
            turnId,
            currentCharacterId: characterId,
            turnStartTime,
            turnDuration: duration,
        };
    },
    [ BattleStateTurnStartAction.type ]: (state, { payload }: BattleStateTurnStartAction) => {
        const { id, characterId, startTime, duration } = payload.turnSnapshot;

        return {
            ...state,
            turnId: id,
            currentCharacterId: characterId,
            turnStartTime: startTime,
            turnDuration: duration
        };
    },
});
