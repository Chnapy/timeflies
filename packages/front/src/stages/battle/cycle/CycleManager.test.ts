import { BRunGlobalTurnStartSAction, BRunTurnStartSAction, getId, TimerTester } from "@timeflies/shared";
import { ReceiveMessageAction } from "../../../socket/WSClient";
import { StoreTest } from "../../../StoreTest";
import { seedCharacter } from "../../../__seeds__/seedCharacter";
import { CycleManager } from "./CycleManager";
import { GlobalTurn } from "./GlobalTurn";
import { TurnState } from "./Turn";
import { Character } from '../entities/Character';

describe('# CycleManager', () => {

    const timerTester = new TimerTester();

    const initStore = (characters: Character[]) => {
        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    current: {
                        characters
                    },
                    cycle: {}
                } as any
            }
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
            seedCharacter(),
            seedCharacter(),
        ];

        initStore(characters);

        const globalTurnCreator: typeof GlobalTurn = jest.fn(() => {

            return {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { },
                    getRemainingTime() { return -1; }
                },
                start() {},
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn() { },
            };
        });

        const cycle = CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch<ReceiveMessageAction<BRunGlobalTurnStartSAction>>({
            type: 'message/receive',
            message: {
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
            }
        });

        expect(globalTurnCreator).toHaveBeenCalledTimes(1);

    });

    it('should synchronize current GlobalTurn on corresponding message', () => {

        const characters = [
            seedCharacter(),
            seedCharacter(),
        ];

        initStore(characters);

        const synchronize = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = () => {

            return {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { },
                    getRemainingTime() { return -1; }
                },
                start() {},
                notifyDeaths() { },
                synchronize,
                synchronizeTurn() { },
            };
        };

        const cycle = CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch<ReceiveMessageAction<BRunGlobalTurnStartSAction>>({
            type: 'message/receive',
            message: {
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
            }
        });

        StoreTest.dispatch<ReceiveMessageAction<BRunGlobalTurnStartSAction>>({
            type: 'message/receive',
            message: {
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
            }
        });

        expect(synchronize).toHaveBeenCalledTimes(1);
    });

    it('should synchronize current Turn on corresponding message', () => {

        const characters = [
            seedCharacter(),
            seedCharacter(),
        ];

        initStore(characters);

        const synchronizeTurn = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = () => {

            return {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { },
                    getRemainingTime() { return -1; }
                },
                start() {},
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn,
            };
        };

        const cycle = CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch<ReceiveMessageAction<BRunGlobalTurnStartSAction>>({
            type: 'message/receive',
            message: {
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
            }
        });

        StoreTest.dispatch<ReceiveMessageAction<BRunTurnStartSAction>>({
            type: 'message/receive',
            message: {
                type: 'battle-run/turn-start',
                sendTime: timerTester.now,
                turnState: {
                    id: 1,
                    startTime: timerTester.now + 200,
                    characterId: order[ 0 ]
                }
            }
        });

        expect(synchronizeTurn).toHaveBeenCalledTimes(1);
    });

    it('should create new GlobalTurn when previous one ends with waiting snapshots', () => {

        const characters = [
            seedCharacter(),
            seedCharacter(),
        ];

        initStore(characters);

        let endGlobalTurn = (endTime: number) => { };

        const onGlobalTurnCreate = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = (_snapshot, _characters, _generateTurnId, onGlobalTurnEnd) => {

            endGlobalTurn = onGlobalTurnEnd;

            onGlobalTurnCreate(_snapshot.id);

            return {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { },
                    getRemainingTime() { return -1; }
                },
                start() {},
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn() { },
            };
        };

        const cycle = CycleManager({ globalTurnCreator });

        const order = characters.map(getId);

        StoreTest.dispatch<ReceiveMessageAction<BRunGlobalTurnStartSAction>>({
            type: 'message/receive',
            message: {
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
            }
        });

        StoreTest.dispatch<ReceiveMessageAction<BRunGlobalTurnStartSAction>>({
            type: 'message/receive',
            message: {
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
            }
        });

        expect(onGlobalTurnCreate).not.toHaveBeenLastCalledWith(2);

        endGlobalTurn(-1);

        expect(onGlobalTurnCreate).toHaveBeenLastCalledWith(2);
    });

    it('should give coherent running state', () => {

        const characters = [
            seedCharacter(),
            seedCharacter(),
        ];

        initStore(characters);

        let currentTurnState: TurnState;

        const globalTurnCreator: typeof GlobalTurn = () => {

            return {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character: characters[ 0 ],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: currentTurnState,
                    synchronize() { },
                    getRemainingTime() { return -1; }
                },
                start() {},
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn() { },
            };
        };

        const cycle = CycleManager({ globalTurnCreator });

        expect(cycle.isRunning).toBe(false);

        const order = characters.map(getId);

        currentTurnState = 'running';

        StoreTest.dispatch<ReceiveMessageAction<BRunGlobalTurnStartSAction>>({
            type: 'message/receive',
            message: {
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
            }
        });

        expect(cycle.isRunning).toBe(true);
    });

});
