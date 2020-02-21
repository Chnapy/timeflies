import { seedCharacter } from "../../../__seeds__/seedCharacter";
import { Character } from "../entities/Character";
import { TimerTester } from "./TimerTester";
import { Turn, TurnState } from "./Turn";
jest.mock("../../../Controller");

describe('#BTurn', () => {

    const timerTester = new TimerTester();

    let character: Character;

    beforeEach(() => {
        timerTester.beforeTest();
        character = seedCharacter({
            staticData: {
                initialFeatures: {
                    actionTime: 2000,
                    life: 100
                }
            }
        });
    });

    afterEach(() => {
        timerTester.afterTest();
    });

    it('should not have timed actions on init', () => {
        const callback = jest.fn();

        const turnIdle = Turn.create(timerTester.now - 100000, character, callback);

        expect(callback).not.toHaveBeenCalled();
    });

    it('should always have coherent state', () => {

        const startTimes = {
            past: timerTester.now - 1000,
            future: timerTester.now + 1000,
            wayBefore: timerTester.now - 5000
        };

        const turnIdle = Turn.create(startTimes.future, character, () => null);
        const turnRunning = Turn.create(startTimes.past, character, () => null);
        const turnEnded = Turn.create(startTimes.wayBefore, character, () => null);

        const states: TurnState[] = ['idle', 'running', 'ended'];

        expect(turnIdle.state).toBe(states[0]);
        expect(turnRunning.state).toBe(states[1]);
        expect(turnEnded.state).toBe(states[2]);
    });

    // it('should run start callback at creation', () => {

    //     const startTime = timerTester.now;

    //     const turnIdle = Turn.create(startTime, character, () => {});
    //     turnIdle.refreshTimedActions();

    //     expect(startFn).toHaveBeenCalled();
    // });

    it('should run callbacks at expected time', () => {

        const now = timerTester.now;

        const startTime = now + 1000;

        const endFn = jest.fn();

        const turnIdle = Turn.create(startTime, character, endFn);
        turnIdle.refreshTimedActions();

        timerTester.advanceBy(900);

        timerTester.advanceBy(200);

        // 1100

        timerTester.advanceBy(1700);

        // 2800

        expect(endFn).not.toHaveBeenCalled();

        timerTester.advanceBy(500);

        // 3300

        expect(endFn).toHaveBeenCalledTimes(1);

    });

});
