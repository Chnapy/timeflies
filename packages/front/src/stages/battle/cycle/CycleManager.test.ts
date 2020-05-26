import { BRunGlobalTurnStartSAction, BRunTurnStartSAction, getId, TimerTester, BRunEndSAction } from "@timeflies/shared";
import { ReceiveMessageAction } from "../../../socket/wsclient-actions";
import { StoreTest } from "../../../StoreTest";
import { seedCharacter } from "../entities/character/Character.seed";
import { CycleManager, NotifyDeathsAction } from "./CycleManager";
import { GlobalTurn, GlobalTurnState } from "./GlobalTurn";
import { TurnState } from "./Turn";
import { Character } from '../entities/character/Character';
import { seedGlobalTurn } from './global-turn.seed';
import { seedTurn } from './turn.seed';

describe('# CycleManager', () => {

    const timerTester = new TimerTester();

    const initStore = (characters: Character<'current'>[]) => {
        StoreTest.initStore({
            battle: {
                current: {
                    characters
                },
                cycle: {}
            } as any
        });
    };

    beforeEach(() => {
        StoreTest.beforeTest();
        timerTester.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
        timerTester.afterTest();
    });

    it('should create a GlobalTurn on corresponding message', () => {

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null })
        ];

        initStore(characters);

        const globalTurnCreator: typeof GlobalTurn = jest.fn(() => {

            return seedGlobalTurn(1, {
                state: 'running',
                currentTurn: seedTurn(1, {
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: 'running',
                }),
            });
        });

        CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 1,
                order,
                startTime: timerTester.now,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        expect(globalTurnCreator).toHaveBeenCalledTimes(1);

    });

    it('should synchronize current GlobalTurn on corresponding message', () => {

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null }),
        ];

        initStore(characters);

        const synchronize = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = () => {

            return seedGlobalTurn(1, {
                state: 'running',
                currentTurn: seedTurn(1, {
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: 'running',
                }),
                synchronize,
            });
        };

        CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 1,
                order,
                startTime: timerTester.now,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 1,
                order,
                startTime: timerTester.now + 200,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        expect(synchronize).toHaveBeenCalledTimes(1);
    });

    it('should synchronize current Turn on corresponding message', () => {

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null })
        ];

        initStore(characters);

        const synchronizeTurn = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = () => {

            return seedGlobalTurn(1, {
                state: 'running',
                currentTurn: seedTurn(1, {
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: 'running',
                }),
                synchronizeTurn,
            });
        };

        CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 1,
                order,
                startTime: timerTester.now,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/turn-start',
            sendTime: timerTester.now,
            turnState: {
                id: 1,
                startTime: timerTester.now + 200,
                characterId: order[ 0 ]
            }
        }));

        expect(synchronizeTurn).toHaveBeenCalledTimes(1);
    });

    it('should create new GlobalTurn when previous one ends with waiting snapshots', () => {

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null })
        ];

        initStore(characters);

        let endGlobalTurn = (endTime: number) => { };

        const onGlobalTurnCreate = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = (_snapshot, _characters, _generateTurnId, onGlobalTurnEnd) => {

            endGlobalTurn = onGlobalTurnEnd;

            onGlobalTurnCreate(_snapshot.id);

            return seedGlobalTurn(1, {
                state: 'running',
                currentTurn: seedTurn(1, {
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: 'running',
                }),
            });
        };

        CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 1,
                order,
                startTime: timerTester.now,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 2,
                order,
                startTime: timerTester.now + 200,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        expect(onGlobalTurnCreate).not.toHaveBeenLastCalledWith(2);

        endGlobalTurn(-1);

        expect(onGlobalTurnCreate).toHaveBeenLastCalledWith(2);
    });

    it('should create new GlobalTurn when previous one ends without waiting snapshots', () => {

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null })
        ];

        initStore(characters);

        let endGlobalTurn = (endTime: number) => { };

        const onGlobalTurnCreate = jest.fn();

        let state: GlobalTurnState = 'running';

        const globalTurnCreator: typeof GlobalTurn = (_snapshot, _characters, _generateTurnId, onGlobalTurnEnd) => {

            endGlobalTurn = onGlobalTurnEnd;

            onGlobalTurnCreate(_snapshot.id);

            return seedGlobalTurn(1, {
                get state() { return state },
                currentTurn: seedTurn(1, {
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: 'running',
                }),
            });
        };

        CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 1,
                order,
                startTime: timerTester.now,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        endGlobalTurn(-1);

        state = 'ended';

        timerTester.advanceBy(200);

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 2,
                order,
                startTime: timerTester.now,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        expect(onGlobalTurnCreate).toHaveBeenLastCalledWith(2);
    });

    it('should check if current character died on notify deaths action', () => {

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null })
        ];

        initStore(characters);

        const notifyDeaths = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = (_snapshot, _characters, _generateTurnId) => {

            return seedGlobalTurn(1, {
                state: 'running',
                currentTurn: seedTurn(1, {
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: 'running',
                }),
                notifyDeaths,
            });
        };

        CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 1,
                order,
                startTime: timerTester.now,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        StoreTest.dispatch<NotifyDeathsAction>({
            type: 'battle/notify-deaths'
        });

        expect(notifyDeaths).toHaveBeenCalledTimes(1);
    });

    it('should give coherent running state', () => {

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null })
        ];

        initStore(characters);

        let currentTurnState: TurnState;

        const globalTurnCreator: typeof GlobalTurn = () => {

            return seedGlobalTurn(1, {
                state: 'running',
                currentTurn: seedTurn(1, {
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: currentTurnState,
                }),
            });
        };

        const cycle = CycleManager({ globalTurnCreator });

        expect(cycle.isRunning).toBe(false);

        const order = characters.map(getId);

        currentTurnState = 'running';

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/global-turn-start',
            sendTime: timerTester.now,
            globalTurnState: {
                id: 1,
                order,
                startTime: timerTester.now,
                currentTurn: {
                    id: 1,
                    characterId: order[ 0 ],
                    startTime: timerTester.now
                }
            }
        }));

        expect(cycle.isRunning).toBe(true);
    });

    it('should stop on battle end', () => {

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null })
        ];

        initStore(characters);

        const stopFn = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = () => {

            return seedGlobalTurn(1, {
                state: 'running',
                currentTurn: seedTurn(1, {
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    state: 'running',
                }),
                stop: stopFn
            });
        };

        const cycle = CycleManager({ globalTurnCreator });

        const order = characters.map(c => c.id);

        cycle.start({
            id: 1,
            order,
            startTime: timerTester.now,
            currentTurn: {
                id: 1,
                characterId: order[ 0 ],
                startTime: timerTester.now
            }
        });

        expect(stopFn).not.toHaveBeenCalled();

        StoreTest.dispatch(ReceiveMessageAction({
            type: 'battle-run/end',
            sendTime: timerTester.now,
            winnerTeamId: 'toto'
        }));

        expect(stopFn).toHaveBeenCalledTimes(1);
    });

});
