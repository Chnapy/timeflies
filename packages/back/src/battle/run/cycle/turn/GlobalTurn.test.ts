import { getIndexGenerator, TimerTester } from '@timeflies/shared';
import { seedCharacter } from '../../entities/character/Character.seed';
import { GlobalTurn, GlobalTurnState } from './GlobalTurn';

describe('# GlobalTurn', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    it('should keep coherent state', () => {

        const characters = seedCharacter();

        const idGenerator = getIndexGenerator();

        const startTime = {
            past: timerTester.now - 1000,
            future: timerTester.now + 1000
        };

        const globalTurnIdle = GlobalTurn(1, startTime.future,
            () => characters, idGenerator,
            () => null, () => null);
        const globalTurnRunning = GlobalTurn(1, startTime.past,
            () => characters, idGenerator,
            () => null, () => null);

        expect(globalTurnIdle.state).toBe<GlobalTurnState>('idle');
        expect(globalTurnRunning.state).toBe<GlobalTurnState>('running');
    });

    it('should change current turn when previous one ends', async () => {

        const characters = seedCharacter({
            alterFn: char => char.initialFeatures.actionTime = 2000
        });

        const turnIdGenerator = getIndexGenerator();

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(1, startTime,
            () => characters, turnIdGenerator,
            () => null, () => null);

        const firstTurnId = globalTurn.currentTurn.id;

        await timerTester.advanceBy(globalTurn.currentTurn.turnDuration + 10);

        expect(globalTurn.currentTurn.id).toBe(firstTurnId + 1);
        expect(globalTurn.currentTurn.getCharacter()).toBe(characters[ '2' ]);
    });

    it('should run callback when last turn ends', async () => {

        const characters = seedCharacter({
            length: 1,
            alterFn: char => char.initialFeatures.actionTime = 2000
        });

        const turnIdGenerator = getIndexGenerator();

        const startTime = timerTester.now;

        const onGTurnEnd = jest.fn();

        GlobalTurn(1, startTime,
            () => characters, turnIdGenerator,
            onGTurnEnd, () => null);

        await timerTester.advanceBy(1900);

        expect(onGTurnEnd).not.toHaveBeenCalled();

        await timerTester.advanceBy(200);

        expect(onGTurnEnd).toHaveBeenCalledTimes(1);
    });

    it('should not run dead character turn', async () => {

        const characters = seedCharacter({
            alterFn: char => char.initialFeatures.actionTime = 2000
        });

        const turnIdGenerator = getIndexGenerator();

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(1, startTime,
            () => characters, turnIdGenerator,
            () => null, () => null);

        const secondChar = characters[ '2' ];

        secondChar.features = {
            ...secondChar.features,
            life: 0
        };

        await timerTester.advanceBy(3000);

        expect(globalTurn.currentTurn.getCharacter()).not.toBe(secondChar);
    });

    it('should stop turn if current character dies', () => {

        const characters = seedCharacter();

        const turnIdGenerator = getIndexGenerator();

        const startTime = timerTester.now;

        const globalTurn = GlobalTurn(1, startTime,
            () => characters, turnIdGenerator,
            () => null, () => null);

        const firstChar = characters[ '1' ];

        firstChar.features = {
            ...firstChar.features,
            life: 0
        };

        globalTurn.notifyDeaths();

        expect(globalTurn.currentTurn.getCharacter()).not.toBe(firstChar);
    });

});
