import { BTurn, TurnState } from "./BTurn";
import { seedBCharacter } from "./seed/seedBCharacter";
import { BCharacter } from "../shared/Character";

describe('#BTurn', () => {

    jest.useFakeTimers();
    
    let character: BCharacter;

    beforeEach(() => {
        character = seedBCharacter([{
            length: 1,
            alterFn: (char) => char.initialFeatures.actionTime = 2000
        }])[0];
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
    });

    it('should always have coherent state', async () => {

        const startTimes = {
            past: Date.now() - 1000,
            future: Date.now() + 1000,
            wayBefore: Date.now() - 5000
        };

        const turnIdle = new BTurn(1, startTimes.future, character, () => null, () => null);
        const turnRunning = new BTurn(1, startTimes.past, character, () => null, () => null);
        const turnEnded = new BTurn(1, startTimes.wayBefore, character, () => null, () => null);

        const states: TurnState[] = ['idle', 'running', 'ended'];

        expect(turnIdle.state).toBe(states[0]);
        expect(turnRunning.state).toBe(states[1]);
        expect(turnEnded.state).toBe(states[2]);
    });

    it('should run callbacks at expected time', async () => {

        const now = Date.now();
        let timePassed = 0;

        const startTime = now + 1000;

        const startFn = jest.fn();
        const endFn = jest.fn();

        const mockAdvanceTimersByTime = jest.advanceTimersByTime;
        jest.advanceTimersByTime = (msToRun: number) => {
            timePassed += msToRun;
            return mockAdvanceTimersByTime(msToRun);
        };

        jest.spyOn(Date, 'now')
            .mockImplementation(() => {
                return now + timePassed;
            });

        const turnIdle = new BTurn(1, startTime, character, startFn, endFn);

        jest.advanceTimersByTime(900);

        expect(startFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(200);

        // 1100

        expect(startFn).toHaveBeenCalled();

        jest.advanceTimersByTime(1700);

        // 2800

        expect(endFn).not.toHaveBeenCalled();

        jest.advanceTimersByTime(500);

        // 3300

        expect(endFn).toHaveBeenCalledTimes(1);
        expect(startFn).toHaveBeenCalledTimes(1);

    });

});
