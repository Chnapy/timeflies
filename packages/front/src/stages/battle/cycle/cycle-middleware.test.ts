import { CycleState } from './cycle-reducer';
import { MiddlewareAPI } from '@reduxjs/toolkit';
import { cycleMiddleware } from './cycle-middleware';
import { seedCharacter } from '../entities/character/Character.seed';
import { BattleStartAction } from '../map/map-reducer';
import { TimerTester, TURN_DELAY } from '@timeflies/shared';
import { BattleStateTurnStartAction, BattleStateTurnEndAction } from '../battleState/battle-state-actions';
import { ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { NotifyDeathsAction } from './cycle-manager-actions';

describe('# cycle-middleware', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    describe('on battle start', () => {

        it('should dispatch turn start action after some times', () => {

            const currentCharacters = [
                seedCharacter('fake', {
                    period: 'current',
                    id: '1',
                    player: null
                }),
                seedCharacter('fake', {
                    period: 'current',
                    id: '2',
                    player: null
                })
            ];

            const api: MiddlewareAPI = {
                dispatch: jest.fn(),
                getState: jest.fn()
            };

            const next = jest.fn();

            const initialState: CycleState = {
                globalTurnId: -1,
                globalTurnOrder: [],
                globalTurnStartTime: -1,
                turnId: -1,
                currentCharacterId: '',
                turnStartTime: -1,
                turnDuration: -1
            };

            const startTime = timerTester.now + 1000;

            const action = BattleStartAction({
                globalTurnSnapshot: {
                    id: 1,
                    startTime,
                    order: [ '1', '2' ],
                    currentTurn: {
                        id: 1,
                        startTime,
                        characterId: '1'
                    }
                }
            } as BattleStartAction[ 'payload' ]);

            cycleMiddleware({
                extractState: () => initialState,
                extractCurrentCharacters: () => currentCharacters
            })(api)(next)(action);

            expect(api.dispatch).not.toHaveBeenCalled();

            timerTester.advanceBy(1050);

            expect(api.dispatch).toHaveBeenCalledWith(BattleStateTurnStartAction(action.payload.globalTurnSnapshot.currentTurn));
        });
    })

    describe('on turn start message', () => {

        it('should update current turn if same id', () => {

            const currentCharacters = [
                seedCharacter('fake', {
                    period: 'current',
                    id: '1',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    }
                }),
                seedCharacter('fake', {
                    period: 'current',
                    id: '2',
                    player: null
                })
            ];

            const api: MiddlewareAPI = {
                dispatch: jest.fn(),
                getState: jest.fn()
            };

            const next = jest.fn();

            const initialState: CycleState = {
                globalTurnId: 1,
                globalTurnOrder: [ '1', '2' ],
                globalTurnStartTime: timerTester.now,
                turnId: 1,
                currentCharacterId: '1',
                turnStartTime: timerTester.now,
                turnDuration: 1000
            };

            const action = ReceiveMessageAction({
                type: 'battle-run/turn-start',
                sendTime: -1,
                turnState: {
                    id: 1,
                    characterId: '1',
                    startTime: timerTester.now - 200,
                    duration: 1000
                }
            });

            cycleMiddleware({
                extractState: () => initialState,
                extractCurrentCharacters: () => currentCharacters
            })(api)(next)(action);

            expect(api.dispatch).not.toHaveBeenCalled();

            timerTester.advanceBy(850);

            expect(api.dispatch).toHaveBeenCalledWith(BattleStateTurnEndAction());
        });

        it('should start it now if no current turn', () => {

            const currentCharacters = [
                seedCharacter('fake', {
                    period: 'current',
                    id: '1',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    }
                }),
                seedCharacter('fake', {
                    period: 'current',
                    id: '2',
                    player: null
                })
            ];

            const api: MiddlewareAPI = {
                dispatch: jest.fn(),
                getState: jest.fn()
            };

            const next = jest.fn();

            const initialState: CycleState = {
                globalTurnId: 1,
                globalTurnOrder: [ '1', '2' ],
                globalTurnStartTime: timerTester.now - 1100,
                turnId: 1,
                currentCharacterId: '1',
                turnStartTime: timerTester.now - 1100,
                turnDuration: 1000
            };

            const turnState = {
                id: 2,
                characterId: '2',
                startTime: timerTester.now,
                duration: 1000
            };

            const action = ReceiveMessageAction({
                type: 'battle-run/turn-start',
                sendTime: -1,
                turnState
            });

            cycleMiddleware({
                extractState: () => initialState,
                extractCurrentCharacters: () => currentCharacters
            })(api)(next)(action);

            timerTester.advanceBy(5);

            expect(api.dispatch).toHaveBeenCalledWith(BattleStateTurnStartAction(turnState));
        });

        it('should add to queue if future, then start it at good time', () => {

            const currentCharacters = [
                seedCharacter('fake', {
                    period: 'current',
                    id: '1',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    }
                }),
                seedCharacter('fake', {
                    period: 'current',
                    id: '2',
                    player: null
                })
            ];

            const api: MiddlewareAPI = {
                dispatch: jest.fn(),
                getState: jest.fn()
            };

            const next = jest.fn();

            const initialState: CycleState = {
                globalTurnId: 1,
                globalTurnOrder: [ '1', '2' ],
                globalTurnStartTime: -1,
                turnId: -1,
                currentCharacterId: '',
                turnStartTime: -1,
                turnDuration: -1
            };

            const middleware = cycleMiddleware({
                extractState: () => initialState,
                extractCurrentCharacters: () => currentCharacters
            })(api)(next);

            const action1 = ReceiveMessageAction({
                type: 'battle-run/turn-start',
                sendTime: -1,
                turnState: {
                    id: 1,
                    characterId: '1',
                    startTime: timerTester.now,
                    duration: 1000
                }
            });

            // required for creating timeout
            middleware(action1);

            initialState.turnId = 1;
            initialState.currentCharacterId = '1';

            const turnState = {
                id: 2,
                characterId: '2',
                startTime: timerTester.now + 1100,
                duration: 1000
            };

            const action2 = ReceiveMessageAction({
                type: 'battle-run/turn-start',
                sendTime: -1,
                turnState
            });

            middleware(action2);

            expect(api.dispatch).not.toHaveBeenCalled();

            timerTester.advanceBy(1150);

            expect(api.dispatch).toHaveBeenCalledWith(BattleStateTurnStartAction(turnState));
        });

        it('should end after some time, then start a new turn', () => {

            const currentCharacters = [
                seedCharacter('fake', {
                    period: 'current',
                    id: '1',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    }
                }),
                seedCharacter('fake', {
                    period: 'current',
                    id: '2',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    }
                })
            ];

            const api: MiddlewareAPI = {
                dispatch: jest.fn(),
                getState: jest.fn()
            };

            const next = jest.fn();

            const initialState: CycleState = {
                globalTurnId: 1,
                globalTurnOrder: [ '1', '2' ],
                globalTurnStartTime: timerTester.now - 1100,
                turnId: 1,
                currentCharacterId: '1',
                turnStartTime: timerTester.now - 1100,
                turnDuration: 1000
            };

            const action = ReceiveMessageAction({
                type: 'battle-run/turn-start',
                sendTime: -1,
                turnState: {
                    id: 2,
                    characterId: '2',
                    startTime: timerTester.now,
                    duration: 1000
                }
            });

            cycleMiddleware({
                extractState: () => initialState,
                extractCurrentCharacters: () => currentCharacters
            })(api)(next)(action);

            initialState.turnId++;
            initialState.currentCharacterId = '2';

            timerTester.advanceBy(1050);

            expect(api.dispatch).toHaveBeenCalledWith(BattleStateTurnEndAction());

            timerTester.advanceBy(TURN_DELAY);

            expect(api.dispatch).toHaveBeenCalledWith(BattleStateTurnStartAction({
                id: 3,
                characterId: '1',
                startTime: expect.any(Number),
                duration: 1000
            }));
        });

        it('should ignore dead characters', () => {

            const currentCharacters = [
                seedCharacter('fake', {
                    period: 'current',
                    id: '1',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    }
                }),
                seedCharacter('fake', {
                    period: 'current',
                    id: '2',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    }
                }),
                seedCharacter('fake', {
                    period: 'current',
                    id: '3',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    },
                    isAlive: false
                })
            ];

            const api: MiddlewareAPI = {
                dispatch: jest.fn(),
                getState: jest.fn()
            };

            const next = jest.fn();

            const initialState: CycleState = {
                globalTurnId: 1,
                globalTurnOrder: [ '1', '2', '3' ],
                globalTurnStartTime: timerTester.now - 1100,
                turnId: 1,
                currentCharacterId: '1',
                turnStartTime: timerTester.now - 1100,
                turnDuration: 1000
            };

            const action = ReceiveMessageAction({
                type: 'battle-run/turn-start',
                sendTime: -1,
                turnState: {
                    id: 2,
                    characterId: '2',
                    startTime: timerTester.now,
                    duration: 1000
                }
            });

            cycleMiddleware({
                extractState: () => initialState,
                extractCurrentCharacters: () => currentCharacters
            })(api)(next)(action);

            initialState.turnId++;
            initialState.currentCharacterId = '2';

            timerTester.advanceBy(1050);

            expect(api.dispatch).toHaveBeenCalledWith(BattleStateTurnEndAction());

            timerTester.advanceBy(TURN_DELAY);

            expect(api.dispatch).toHaveBeenCalledWith(BattleStateTurnStartAction({
                id: 3,
                characterId: '1',
                startTime: expect.any(Number),
                duration: 1000
            }));
        });
    });

    describe('on notify deaths', () => {

        it('should end current turn if character died', () => {

            const currentCharacters = [
                seedCharacter('fake', {
                    period: 'current',
                    id: '1',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    }
                }),
                seedCharacter('fake', {
                    period: 'current',
                    id: '2',
                    player: null,
                    initialFeatures: {
                        actionTime: 1000,
                    }
                })
            ];

            const api: MiddlewareAPI = {
                dispatch: jest.fn(),
                getState: jest.fn()
            };

            const next = jest.fn();

            const initialState: CycleState = {
                globalTurnId: 1,
                globalTurnOrder: [ '1', '2' ],
                globalTurnStartTime: timerTester.now - 1100,
                turnId: 1,
                currentCharacterId: '1',
                turnStartTime: timerTester.now - 1100,
                turnDuration: 1000
            };

            const action = ReceiveMessageAction({
                type: 'battle-run/turn-start',
                sendTime: -1,
                turnState: {
                    id: 2,
                    characterId: '2',
                    startTime: timerTester.now,
                    duration: 1000
                }
            });

            const middleware = cycleMiddleware({
                extractState: () => initialState,
                extractCurrentCharacters: () => currentCharacters
            })(api)(next);

            middleware(action);

            initialState.turnId++;
            initialState.currentCharacterId = '2';

            timerTester.advanceBy(50);

            (currentCharacters[ 1 ].isAlive as any) = false;

            middleware(NotifyDeathsAction());

            timerTester.advanceBy(50);

            expect(api.dispatch).toHaveBeenCalledWith(BattleStateTurnEndAction());
        });
    });
});
