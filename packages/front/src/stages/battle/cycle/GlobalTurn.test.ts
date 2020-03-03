import { CharacterFeatures, getId, getIndexGenerator, TimerTester } from "@timeflies/shared";
import { StoreTest } from "../../../StoreTest";
import { seedCharacter } from "../../../__seeds__/seedCharacter";
import { GlobalTurn, GlobalTurnState } from "./GlobalTurn";

describe('# GlobalTurn', () => {

    const timerTester = new TimerTester();

    const getSnapshot = (startTime: number, order: string[]) => ({
        id: 1, startTime, order, currentTurn: {
            id: 1, characterId: order[0], startTime
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

        const characters = [
            seedCharacter({
                staticData: {
                    initialFeatures: {
                        actionTime: 2000,
                        life: 100
                    }
                }
            })
        ];

        const idGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = {
            past: timerTester.now - 1000,
            future: timerTester.now + 1000
        };

        const globalTurnIdle = GlobalTurn(getSnapshot(startTime.future, order),
            characters, idGenerator,
            () => null);
        const globalTurnRunning = GlobalTurn(getSnapshot(startTime.past, order),
            characters, idGenerator,
            () => null);

        expect(globalTurnIdle.state).toBe<GlobalTurnState>('idle');
        expect(globalTurnRunning.state).toBe<GlobalTurnState>('running');
    });

    it('should change current turn when previous one ends', () => {

        const characters = [
            seedCharacter({
                staticData: {
                    id: '1',
                    initialFeatures: {
                        actionTime: 2000,
                        life: 100
                    }
                }
            }),
            seedCharacter({
                staticData: {
                    id: '2',
                    initialFeatures: {
                        actionTime: 2000,
                        life: 100
                    }
                }
            })
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            () => null);

        const firstTurnId = globalTurn.currentTurn.id;

        timerTester.advanceBy(globalTurn.currentTurn.turnDuration + 300);

        expect(globalTurn.currentTurn.id).toBe(firstTurnId + 1);
        expect(globalTurn.currentTurn.character).toBe(characters[1]);
    });

    it('should run callback when last turn ends', () => {

        const characters = [
            seedCharacter({
                staticData: {
                    initialFeatures: {
                        actionTime: 2000,
                        life: 100
                    }
                }
            }),
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const onGTurnEnd = jest.fn();

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            onGTurnEnd);

        timerTester.advanceBy(1900);

        expect(onGTurnEnd).not.toHaveBeenCalled();

        timerTester.advanceBy(200);

        expect(onGTurnEnd).toHaveBeenCalledTimes(1);
    });

    it('should not run dead character turn', () => {

        const characters = [
            seedCharacter({
                staticData: {
                    id: '1',
                    initialFeatures: {
                        actionTime: 2000,
                        life: 100
                    }
                }
            }),
            seedCharacter({
                staticData: {
                    id: '2',
                    initialFeatures: {
                        actionTime: 2000,
                        life: 100
                    }
                }
            }),
            seedCharacter({
                staticData: {
                    id: '3',
                    initialFeatures: {
                        actionTime: 2000,
                        life: 100
                    }
                }
            })
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            () => null);

        const secondChar = characters[1];

        (secondChar.features as CharacterFeatures).life = 0;

        timerTester.advanceBy(3000);

        expect(globalTurn.currentTurn.character).not.toBe(secondChar);
    });

    it('should stop turn if current character dies', () => {

        const characters = [
            seedCharacter({
                staticData: {
                    id: '1',
                    initialFeatures: {
                        actionTime: 2000,
                        life: 100
                    }
                }
            }),
            seedCharacter({
                staticData: {
                    id: '2',
                    initialFeatures: {
                        actionTime: 2000,
                        life: 100
                    }
                }
            })
        ];

        const turnIdGenerator = getIndexGenerator();

        const order = characters.map(getId);

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(getSnapshot(startTime, order),
            characters, turnIdGenerator,
            () => null);

        const firstChar = characters[0];

        (firstChar.features as CharacterFeatures).life = 0;

        globalTurn.notifyDeaths();

        expect(globalTurn.currentTurn.character).not.toBe(firstChar);
    });

});
