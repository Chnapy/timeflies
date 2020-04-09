import { CharacterFeatures, getId, getIndexGenerator, TimerTester, GlobalTurnSnapshot } from "@timeflies/shared";
import { StoreTest } from "../../../StoreTest";
import { seedCharacter } from "../entities/character/Character.seed";
import { GlobalTurn, GlobalTurnState } from "./GlobalTurn";
import { Turn, TurnState } from "./Turn";

describe('# GlobalTurn', () => {

    const timerTester = new TimerTester();

    const getSnapshot = (startTime: number, order: string[]): GlobalTurnSnapshot => ({
        id: 1, startTime, order, currentTurn: {
            id: 1, characterId: order[ 0 ], startTime
        }
    });

    beforeEach(() => {
        StoreTest.beforeTest();
        timerTester.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
        timerTester.afterTest();
    });

    it('should keep coherent state', () => {

        let onTurnEndFn;
        const turnCreator: typeof Turn = (id, startTime, character, onTurnEnd) => {
            onTurnEndFn = onTurnEnd;
            return {
                id: 1,
                character: characters[ 0 ],
                startTime: timerTester.now,
                turnDuration: 1000,
                endTime: timerTester.now + 1000,
                refreshTimedActions() { },
                state: 'running',
                synchronize() { },
                getRemainingTime(period) { return -1 }
            }
        };

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null })
        ];

        const idGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = {
            past: timerTester.now - 1000,
            future: timerTester.now + 1000
        };

        const globalTurnIdle = GlobalTurn(getSnapshot(startTime.future, order),
            characters, idGenerator,
            () => null,
            { turnCreator });
        const globalTurnRunning = GlobalTurn(getSnapshot(startTime.past, order),
            characters, idGenerator,
            () => null,
            { turnCreator });

        expect(globalTurnIdle.state).toBe<GlobalTurnState>('idle');
        expect(globalTurnRunning.state).toBe<GlobalTurnState>('running');

        const globalTurnEnded = GlobalTurn(getSnapshot(timerTester.now, order),
            characters, idGenerator,
            () => null,
            { turnCreator });
        onTurnEndFn();

        expect(globalTurnEnded.state).toBe<GlobalTurnState>('ended');
    });

    it('should change current turn when previous one ends', () => {

        let onTurnEndFn = () => { };

        const turnCreator: typeof Turn = (id, startTime, character, onTurnEnd) => {
            onTurnEndFn = onTurnEnd;
            return {
                id,
                character,
                startTime,
                turnDuration: 1000,
                endTime: timerTester.now + 1000,
                refreshTimedActions() { },
                state: 'running',
                synchronize() { },
                getRemainingTime(period) { return -1 }
            }
        };

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null })
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            () => null,
            { turnCreator });

        const firstTurnId = globalTurn.currentTurn.id;

        onTurnEndFn();

        expect(globalTurn.currentTurn.id).toBe(firstTurnId + 1);
        expect(globalTurn.currentTurn.character).toBe(characters[ 1 ]);
    });

    it('should load waiting turn when previous one ends', () => {

        let onTurnEndFn = () => { };
        let turnState: TurnState = 'running';

        const turnCreator: typeof Turn = (id, startTime, character, onTurnEnd) => {
            onTurnEndFn = onTurnEnd;
            return {
                id,
                character,
                startTime,
                turnDuration: 1000,
                endTime: timerTester.now + 1000,
                refreshTimedActions() { },
                get state() { return turnState; },
                synchronize() { },
                getRemainingTime(period) { return -1 }
            }
        };

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null })
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            () => null,
            { turnCreator });

        globalTurn.synchronizeTurn({
            id: 5,
            startTime: timerTester.now,
            characterId: characters[ 1 ].id
        });

        turnState = 'ended';
        onTurnEndFn();

        expect(globalTurn.currentTurn.id).toBe(5);
        expect(globalTurn.currentTurn.character).toBe(characters[ 1 ]);
    });

    it('should run callback when last turn ends', () => {

        let onTurnEndFn = () => { };

        const turnCreator: typeof Turn = (id, startTime, character, onTurnEnd) => {
            onTurnEndFn = onTurnEnd;
            return {
                id,
                character,
                startTime,
                turnDuration: 1000,
                endTime: timerTester.now + 1000,
                refreshTimedActions() { },
                state: 'running',
                synchronize() { },
                getRemainingTime(period) { return -1 }
            }
        };

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null })
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const onGTurnEnd = jest.fn();

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            onGTurnEnd,
            { turnCreator });

        onTurnEndFn();

        expect(onGTurnEnd).toHaveBeenCalledTimes(1);
    });

    it('should not run dead character turn', () => {

        let onTurnEndFn = () => { };

        const turnCreator: typeof Turn = (id, startTime, character, onTurnEnd) => {
            onTurnEndFn = onTurnEnd;
            return {
                id,
                character,
                startTime,
                turnDuration: 1000,
                endTime: timerTester.now + 1000,
                refreshTimedActions() { },
                state: 'running',
                synchronize() { },
                getRemainingTime(period) { return -1 }
            }
        };

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null }),
            seedCharacter('fake', { period: 'current', id: '3', player: null })
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            () => null,
            { turnCreator });

        const secondChar = characters[ 1 ];

        (secondChar.isAlive as boolean) = false;

        onTurnEndFn();

        expect(globalTurn.currentTurn.character).not.toBe(secondChar);
    });

    it('should stop turn if current character dies', () => {

        const turnCreator: typeof Turn = (id, startTime, character, onTurnEnd) => {
            return {
                id,
                character,
                startTime,
                turnDuration: 1000,
                endTime: timerTester.now + 1000,
                refreshTimedActions() { },
                state: 'running',
                synchronize() { },
                getRemainingTime(period) { return -1 }
            }
        };

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null }),
            seedCharacter('fake', { period: 'current', id: '2', player: null })
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            () => null,
            { turnCreator });

        const firstChar = characters[ 0 ];

        (firstChar.isAlive as boolean) = false;

        globalTurn.notifyDeaths();

        expect(globalTurn.currentTurn.character).not.toBe(firstChar);
    });

    it('should synchronize correctly', () => {

        let synchronize = jest.fn();

        const turnCreator: typeof Turn = (id, startTime, character, onTurnEnd) => {
            return {
                id,
                character,
                startTime,
                turnDuration: 1000,
                endTime: timerTester.now + 1000,
                refreshTimedActions() { },
                state: 'running',
                synchronize,
                getRemainingTime(period) { return -1 }
            }
        };

        const characters = [
            seedCharacter('fake', { period: 'current', id: '1', player: null })
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            () => null,
            { turnCreator });

        globalTurn.synchronize({
            id: 1,
            startTime: timerTester.now + 200,
            order,
            currentTurn: {
                id: 1,
                startTime: timerTester.now + 200,
                characterId: order[ 0 ]
            }
        });

        expect(globalTurn.state).toBe<GlobalTurnState>('idle');
        expect(synchronize).toHaveBeenCalledTimes(1);
    });

});
