import { TimerTester } from "@timeflies/shared";
import { seedCharacter } from "../../entities/character/Character.seed";
import { Character } from "../../entities/character/Character";
import { Turn, TurnState } from "./Turn";
import { waitTimeoutPool } from '../../../../wait-timeout-pool';

describe('# Turn', () => {

    const timerTester = new TimerTester();

    let character: Character;

    const killPromises = (...promises: (PromiseLike<unknown> | undefined)[]) => {
        waitTimeoutPool.setPoolEnable(false);

        return Promise.all([
            waitTimeoutPool.clearAll(),
            ...promises
        ]);
    };

    beforeEach(() => {
        timerTester.beforeTest();
        character = seedCharacter({
            length: 1,
            alterFn: (char) => char.initialFeatures.actionTime = 2000
        })[ '1' ];
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    it('should not have timed actions on init', () => {
        const callback = jest.fn();

        Turn(1, timerTester.now - 100000, () => character, callback, callback);

        expect(callback).not.toHaveBeenCalled();
    });

    it('should always have coherent state', () => {

        const startTimes = {
            past: timerTester.now - 1000,
            future: timerTester.now + 1000,
            wayBefore: timerTester.now - 5000
        };

        const turnIdle = Turn(1, startTimes.future, () => character, () => null, () => undefined);
        const turnRunning = Turn(1, startTimes.past, () => character, () => null, () => undefined);
        const turnEnded = Turn(1, startTimes.wayBefore, () => character, () => null, () => undefined);

        const states: TurnState[] = [ 'idle', 'running', 'ended' ];

        expect(turnIdle.state).toBe(states[ 0 ]);
        expect(turnRunning.state).toBe(states[ 1 ]);
        expect(turnEnded.state).toBe(states[ 2 ]);
    });

    it('should run start callback at creation', async () => {

        const startTime = timerTester.now;

        const startFn = jest.fn();

        const turnIdle = Turn(1, startTime, () => character, startFn, () => undefined);
        const p = turnIdle.refreshTimedActions();

        expect(startFn).toHaveBeenCalled();

        await killPromises(p);
    });

    it('should run callbacks at expected time', async () => {

        const now = timerTester.now;

        const startTime = now + 1000;

        const startFn = jest.fn();
        const endFn = jest.fn();

        const turnIdle = Turn(1, startTime, () => character, startFn, endFn);
        const p = turnIdle.refreshTimedActions();

        await timerTester.advanceBy(900);

        expect(startFn).not.toHaveBeenCalled();

        await timerTester.advanceBy(200);

        // 1100

        expect(startFn).toHaveBeenCalled();

        await timerTester.advanceBy(1700);

        // 2800

        expect(endFn).not.toHaveBeenCalled();

        await timerTester.advanceBy(500);

        // 3300

        expect(endFn).toHaveBeenCalledTimes(1);
        expect(startFn).toHaveBeenCalledTimes(1);

        await killPromises(p);
    });

});
