import { getTurnIdGenerator } from '../../shared/getTurnIdGenerator';
import { TimerTester } from '../../__testUtils__/TimerTester';
import { BGlobalTurn, GlobalTurnState } from './BGlobalTurn';
import { seedBCharacter } from '../../__seeds__/seedBCharacter';

describe('#BGlobalTurn', () => {

    const timerTester = new TimerTester();

    beforeEach(() => {
        timerTester.beforeTest();
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    it('should keep coherent state', () => {

        const characters = seedBCharacter();

        const idGenerator = getTurnIdGenerator();

        const startTime = {
            past: timerTester.now - 1000,
            future: timerTester.now + 1000
        };

        const globalTurnIdle = new BGlobalTurn(1, startTime.future,
            characters, idGenerator,
            () => null, () => null);
        const globalTurnRunning = new BGlobalTurn(1, startTime.past,
            characters, idGenerator,
            () => null, () => null);

        expect(globalTurnIdle.state).toBe<GlobalTurnState>('idle');
        expect(globalTurnRunning.state).toBe<GlobalTurnState>('running');
    });

    it('should change current turn when previous one ends', () => {

        const characters = seedBCharacter({
            alterFn: char => char.initialFeatures.actionTime = 2000
        });

        const turnIdGenerator = getTurnIdGenerator();

        const startTime = timerTester.now;

        const globalTurn = new BGlobalTurn(1, startTime,
            characters, turnIdGenerator,
            () => null, () => null);

        const firstTurnId = globalTurn.currentTurn.id;

        timerTester.advanceBy(globalTurn.currentTurn.turnDuration + 10);

        expect(globalTurn.currentTurn.id).toBe(firstTurnId + 1);
        expect(globalTurn.currentTurn.character).toBe(characters[ 1 ]);
    });

    it('should run callback when last turn ends', () => {

        const characters = seedBCharacter({
            length: 1,
            alterFn: char => char.initialFeatures.actionTime = 2000
        });

        const turnIdGenerator = getTurnIdGenerator();

        const startTime = timerTester.now;

        const onGTurnEnd = jest.fn();

        const globalTurn = new BGlobalTurn(1, startTime,
            characters, turnIdGenerator,
            onGTurnEnd, () => null);

        timerTester.advanceBy(1900);

        expect(onGTurnEnd).not.toHaveBeenCalled();

        timerTester.advanceBy(200);

        expect(onGTurnEnd).toHaveBeenCalledTimes(1);
    });

});
