import { CycleState, cycleReducer } from './cycle-reducer';
import { BattleStartAction } from '../map/map-reducer';
import { BattleStateTurnStartAction } from '../battleState/battle-state-actions';

describe('# cycle-reducer', () => {

    describe('on battle start', () => {

        it('should fill turn state', () => {

            const initialState: CycleState = {
                globalTurnId: -1,
                globalTurnStartTime: -1,
                globalTurnOrder: [],
                turnId: -1,
                currentCharacterId: '',
                turnStartTime: -1,
                turnDuration: -1
            };

            const state1 = cycleReducer(initialState, BattleStartAction({
                globalTurnSnapshot: {
                    id: 1,
                    startTime: 12,
                    order: [ '1', '2' ],
                    currentTurn: {
                        id: 1,
                        characterId: '1',
                        startTime: 12,
                        duration: 1000
                    }
                }
            } as BattleStartAction[ 'payload' ]));

            expect(state1).toEqual<CycleState>({
                globalTurnId: 1,
                globalTurnStartTime: 12,
                globalTurnOrder: [ '1', '2' ],
                currentCharacterId: '1',
                turnId: 1,
                turnStartTime: 12,
                turnDuration: 1000
            });
        });
    });

    describe('on turn start', () => {

        it('should fill turn state', () => {

            const initialState: CycleState = {
                globalTurnId: 1,
                globalTurnStartTime: 12,
                globalTurnOrder: [ '1', '2' ],
                turnId: -1,
                currentCharacterId: '',
                turnStartTime: -1,
                turnDuration: -1
            };

            const state1 = cycleReducer(initialState, BattleStateTurnStartAction({
                id: 1,
                characterId: '1',
                startTime: 12,
                duration: 1000
            }));

            expect(state1).toEqual<CycleState>({
                globalTurnId: 1,
                globalTurnStartTime: 12,
                globalTurnOrder: [ '1', '2' ],
                currentCharacterId: '1',
                turnId: 1,
                turnStartTime: 12,
                turnDuration: 1000
            });
        });
    });
});
