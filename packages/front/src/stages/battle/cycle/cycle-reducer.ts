import { createReducer } from '@reduxjs/toolkit';
import { BattleStateTurnStartAction } from '../battleState/battle-state-actions';
import { BattleStartAction } from '../battle-actions';
import { BattleDataPeriod } from '../snapshot/battle-data';
import { switchUtil } from '@timeflies/shared';
import { BattleState } from '../../../ui/reducers/battle-reducers/battle-reducer';

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

export const getInitialCycleState = (): CycleState => ({
    globalTurnId: -1,
    globalTurnOrder: [],
    globalTurnStartTime: -1,
    turnId: -1,
    currentCharacterId: '',
    turnStartTime: -1,
    turnDuration: -1
});

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

export const getTurnRemainingTime = (battle: BattleState, period: BattleDataPeriod) => {
    const { turnStartTime, turnDuration } = battle.cycleState;
    const endTime = turnStartTime + turnDuration;

    return switchUtil(period, {
        current: (): number => Math.max(endTime - Date.now(), 0),

        future: (): number => {
            const { spellActionSnapshotList } = battle.snapshotState;

            const lastSnapshot = spellActionSnapshotList[ spellActionSnapshotList.length - 1 ];

            const currentRemainingTime = getTurnRemainingTime(battle, 'current');

            if (!lastSnapshot) {
                return currentRemainingTime;
            }

            const futureRemainingTime = endTime - lastSnapshot.startTime - lastSnapshot.duration;

            return Math.min(futureRemainingTime, currentRemainingTime);
        }
    })();
};

export const cycleReducer = createReducer(getInitialCycleState(), {

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
