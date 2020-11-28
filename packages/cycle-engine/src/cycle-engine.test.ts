import { createCycleEngine } from './cycle-engine';
import { CycleEngineListeners } from './listeners';
import { timerTester } from './timer-tester';


describe('# Cycle engine', () => {

    const expectedDelays = {
        beforeStart: 8000,
        betweenTurns: 4000
    };

    const expectListener = <K extends keyof CycleEngineListeners>(name: K, listener: () => void) => ({
        toHaveBeenCalledWith: (...expectedParams: Parameters<Required<CycleEngineListeners>[ K ]>) =>
            expect(listener).toHaveBeenCalledWith<Parameters<Required<CycleEngineListeners>[ K ]>>(...expectedParams)
    });

    it('start first turn after 8s', async () => {

        const turnStartListener = jest.fn();

        const engine = createCycleEngine({
            charactersDurations: {
                'foo': 2000,
                'bar': 1000
            },
            charactersDurationsList: [ 'foo', 'bar' ],
            listeners: {
                turnStart: turnStartListener
            }
        });

        const enginePromise = engine.start();

        await timerTester.advance(expectedDelays.beforeStart, {
            runJustBeforeItEnds: () => expect(turnStartListener).not.toHaveBeenCalled()
        });

        const startTime = timerTester.now();

        expectListener('turnStart', turnStartListener).toHaveBeenCalledWith({
            currentTurn: {
                turnIndex: 0,
                characterIndex: 0,
                characterId: 'foo',
                startTime: startTime,
                duration: 2000,
                endTime: startTime + 2000
            }
        });

        await timerTester.endTimer(enginePromise);
    });

    const getStartedEngine = async () => {

        const turnStartListener = jest.fn();
        const turnEndListener = jest.fn();

        const engine = createCycleEngine({
            charactersDurations: {
                'foo': 2000,
                'bar': 1000,
                'toto': 3000
            },
            charactersDurationsList: [ 'foo', 'bar', 'toto' ],
            listeners: {
                turnStart: turnStartListener,
                turnEnd: turnEndListener
            }
        });

        const enginePromise = engine.start();

        await timerTester.advance(8000);

        expect(turnStartListener).toHaveBeenCalled();

        const startTime = timerTester.now();

        return {
            engine,
            enginePromise,
            startTime,
            turnStartListener,
            turnEndListener
        };
    };

    it('play next turn 4s after previous one', async () => {

        const {
            engine,
            enginePromise,
            turnStartListener
        } = await getStartedEngine();

        turnStartListener.mockClear();

        await timerTester.advance(2000);

        const nextTurnPromise = engine.startNextTurn();

        const nextTurnStartTime = timerTester.now() + expectedDelays.betweenTurns;

        await timerTester.advance(expectedDelays.betweenTurns, {
            runJustBeforeItEnds: () => expect(turnStartListener).not.toHaveBeenCalled()
        });

        expectListener('turnStart', turnStartListener).toHaveBeenCalledWith({
            currentTurn: {
                turnIndex: 1,
                characterIndex: 1,
                characterId: 'bar',
                startTime: nextTurnStartTime,
                duration: 1000,
                endTime: nextTurnStartTime + 1000
            }
        });

        await timerTester.endTimer(nextTurnPromise, enginePromise);
    });

    describe('turn duration', () => {

        it('end turn after character duration passed', async () => {

            const {
                enginePromise,
                startTime,
                turnEndListener
            } = await getStartedEngine();

            await timerTester.advance(2000, {
                runJustBeforeItEnds: () => expect(turnEndListener).not.toHaveBeenCalled()
            });

            expectListener('turnEnd', turnEndListener).toHaveBeenCalledWith({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    startTime: startTime,
                    duration: 2000,
                    endTime: startTime + 2000,
                    endTimeDelta: 0
                }
            });

            await timerTester.endTimer(enginePromise);
        });

        it('change current turn duration after character duration change', async () => {

            const {
                engine,
                enginePromise,
                startTime,
                turnEndListener
            } = await getStartedEngine();

            await timerTester.advance(500);

            engine.setCharacterDuration({
                foo: 3000
            });

            await timerTester.advance(2500, {
                runJustBeforeItEnds: () => expect(turnEndListener).not.toHaveBeenCalled()
            });

            expectListener('turnEnd', turnEndListener).toHaveBeenCalledWith({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    startTime: startTime,
                    duration: 3000,
                    endTime: startTime + 3000,
                    endTimeDelta: 0
                }
            });

            await timerTester.endTimer(enginePromise);
        });

        it('end turn after character duration change and less than current passed time', async () => {

            const {
                engine,
                enginePromise,
                startTime,
                turnEndListener
            } = await getStartedEngine();

            await timerTester.advance(1500);

            engine.setCharacterDuration({
                foo: 1200
            });

            await timerTester.triggerPromises();

            expectListener('turnEnd', turnEndListener).toHaveBeenCalledWith({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    startTime: startTime,
                    duration: 1200,
                    endTime: startTime + 1200,
                    endTimeDelta: 300
                }
            });

            await timerTester.endTimer(enginePromise);
        });
    });

    describe('disabled characters', () => {
        it('do not play disabled characters turn', async () => {

            const {
                engine,
                enginePromise,
                turnStartListener
            } = await getStartedEngine();

            await timerTester.advance(2000);

            turnStartListener.mockClear();

            engine.disableCharacter('bar');

            const nextTurnPromise = engine.startNextTurn();
            await timerTester.triggerPromises();

            await timerTester.advance(expectedDelays.betweenTurns);

            const startTime = timerTester.now();

            expectListener('turnStart', turnStartListener).toHaveBeenCalledWith({
                currentTurn: {
                    turnIndex: 1,
                    characterIndex: 2,
                    characterId: 'toto',
                    startTime: startTime,
                    duration: 3000,
                    endTime: startTime + 3000
                }
            });

            await timerTester.endTimer(nextTurnPromise, enginePromise);
        });

        it('end turn when current character set disabled', async () => {

            const {
                engine,
                enginePromise,
                startTime,
                turnEndListener
            } = await getStartedEngine();

            await timerTester.advance(500);

            engine.disableCharacter('foo');

            await timerTester.triggerPromises();

            expectListener('turnEnd', turnEndListener).toHaveBeenCalledWith({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    startTime: startTime,
                    duration: 2000,
                    endTime: startTime + 2000,
                    endTimeDelta: -1500
                }
            });

            await timerTester.endTimer(enginePromise);
        });
    });
});
