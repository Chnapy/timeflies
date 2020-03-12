import { TimerTester, BRunGlobalTurnStartSAction, getId, BRunTurnStartSAction } from "@timeflies/shared";
import { StoreTest } from "../../../StoreTest";
import { CycleManager } from "./CycleManager";
import { seedCharacter } from "../../../__seeds__/seedCharacter";
import { ReceiveMessageAction } from "../../../socket/WSClient";
import { GlobalTurn } from "./GlobalTurn";
import { TurnState } from "./Turn";

describe('# CycleManager', () => {

    const timerTester = new TimerTester();

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

        const globalTurnCreator: typeof GlobalTurn = jest.fn(() => {

            return {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character: characters[0],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { }
                },
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn() { },
            };
        });

        const cycle = CycleManager({
            characters
        }, { globalTurnCreator });

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
                        characterId: order[0],
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

        const synchronize = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = () => {

            return {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character: characters[0],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { }
                },
                notifyDeaths() { },
                synchronize,
                synchronizeTurn() { },
            };
        };

        const cycle = CycleManager({
            characters
        }, { globalTurnCreator });

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
                        characterId: order[0],
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
                        characterId: order[0],
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

        const synchronizeTurn = jest.fn();

        const globalTurnCreator: typeof GlobalTurn = () => {

            return {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character: characters[0],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { }
                },
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn,
            };
        };

        const cycle = CycleManager({
            characters
        }, { globalTurnCreator });

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
                        characterId: order[0],
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
                    characterId: order[0]
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
                    character: characters[0],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: 'running',
                    synchronize() { }
                },
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn() { },
            };
        };

        const cycle = CycleManager({
            characters
        }, { globalTurnCreator });

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
                        characterId: order[0],
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
                        characterId: order[0],
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

        let currentTurnState: TurnState;

        const globalTurnCreator: typeof GlobalTurn = () => {

            return {
                id: 1,
                state: 'running',
                currentTurn: {
                    id: 1,
                    character: characters[0],
                    startTime: timerTester.now,
                    turnDuration: 1000,
                    endTime: timerTester.now + 1000,
                    refreshTimedActions() { },
                    state: currentTurnState,
                    synchronize() { }
                },
                notifyDeaths() { },
                synchronize() { },
                synchronizeTurn() { },
            };
        };

        const cycle = CycleManager({
            characters
        }, { globalTurnCreator });

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
                        characterId: order[0],
                        startTime: timerTester.now
                    }
                }
            }
        });

        expect(cycle.isRunning).toBe(true);
    });

});
