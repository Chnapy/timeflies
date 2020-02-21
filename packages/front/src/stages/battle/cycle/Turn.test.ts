import { TimerTester } from '@timeflies/shared';
import { BattleTurnStartAction, BattleTurnEndAction } from '../../../phaser/battleReducers/BattleReducerManager';
import { StoreTest } from '../../../StoreTest';
import { seedCharacter } from "../../../__seeds__/seedCharacter";
import { Character } from "../entities/Character";
import { Turn, TurnState } from "./Turn";

describe('#BTurn', () => {

    const timerTester = new TimerTester();

    let character: Character;

    beforeEach(() => {
        StoreTest.beforeTest();
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
        StoreTest.afterTest();
        timerTester.afterTest();
    });

    it('should not have timed actions on init', () => {
        const callback = jest.fn();

        const turnIdle = Turn(1, timerTester.now - 100000, character, callback);

        expect(StoreTest.getActions()).toHaveLength(0);
    });

    it('should always have coherent state', () => {

        const startTimes = {
            past: timerTester.now - 1000,
            future: timerTester.now + 1000,
            wayBefore: timerTester.now - 5000
        };

        const turnIdle = Turn(1, startTimes.future, character, () => null);
        const turnRunning = Turn(1, startTimes.past, character, () => null);
        const turnEnded = Turn(1, startTimes.wayBefore, character, () => null);

        const states: TurnState[] = ['idle', 'running', 'ended'];

        expect(turnIdle.state).toBe(states[0]);
        expect(turnRunning.state).toBe(states[1]);
        expect(turnEnded.state).toBe(states[2]);
    });

    it('should dispatch start action at creation', () => {

        const startTime = timerTester.now;

        const turnIdle = Turn(1, startTime, character, () => { });
        turnIdle.refreshTimedActions();

        expect(StoreTest.getActions()).toHaveLength(1);
        expect(StoreTest.getActions()).toEqual<[BattleTurnStartAction]>([{
            type: 'battle/turn/start',
            startTime,
            character
        }]);
    });

    it('should run callbacks at expected time', () => {

        const now = timerTester.now;

        const startTime = now + 1000;

        const endFn = jest.fn();

        const turnIdle = Turn(1, startTime, character, endFn);
        turnIdle.refreshTimedActions();

        timerTester.advanceBy(900);

        expect(StoreTest.getActions()).toHaveLength(0);

        timerTester.advanceBy(200);

        // 1100

        expect(StoreTest.getActions()).toEqual<[BattleTurnStartAction]>([{
            type: 'battle/turn/start',
            startTime,
            character
        }]);

        timerTester.advanceBy(1700);

        // 2800

        expect(endFn).not.toHaveBeenCalled();

        expect(StoreTest.getActions()).toHaveLength(1);

        timerTester.advanceBy(500);

        // 3300

        expect(endFn).toHaveBeenCalledTimes(1);

        expect(StoreTest.getActions()).toEqual<[BattleTurnStartAction, BattleTurnEndAction]>([
            {
                type: 'battle/turn/start',
                startTime,
                character
            },
            {
                type: 'battle/turn/end',
                character
            }
        ]);

    });

});
