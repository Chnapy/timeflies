import { createCycleEngine } from './cycle-engine';
import { CycleEngineListeners, TurnInfos } from './listeners';
import { timerTester } from '@timeflies/devtools';


describe('# Cycle engine', () => {

    const expectedDelays = {
        beforeStart: 8000,
        betweenTurns: 4000
    };

    type PartialArray<A extends any[]> = Partial<A[ number ]>[];

    type ListenerBody<K extends keyof CycleEngineListeners> = PartialArray<Parameters<Required<CycleEngineListeners>[ K ]>>;

    const expectListener = <K extends keyof CycleEngineListeners>(name: K, listener: () => void) => ({
        calledWithPartial: (...expectedParams: ListenerBody<K>) =>
            expect(listener).toHaveBeenCalledWith<ListenerBody<K>>(...expectedParams.map(expect.objectContaining))
    });

    const getTimeInfos = (startTime: number, duration: number): Pick<TurnInfos, 'startTime' | 'duration' | 'endTime'> => ({
        startTime,
        duration,
        endTime: startTime + duration,
    });

    describe('engine start', () => {
        it('start first turn after 8s', async () => {

            const turnStartListener = jest.fn();

            const engine = createCycleEngine({
                charactersDurations: {
                    'foo': 2000,
                    'bar': 1000
                },
                charactersList: [ 'foo', 'bar' ],
                listeners: {
                    turnStart: turnStartListener
                }
            });

            expect(engine.isStarted()).toEqual(false);

            const enginePromise = engine.start();

            expect(engine.isStarted()).toEqual(true);

            await timerTester.advance(expectedDelays.beforeStart, {
                runJustBeforeItEnds: () => {
                    expect(turnStartListener).not.toHaveBeenCalled();
                }
            });

            const startTime = timerTester.now();

            expectListener('turnStart', turnStartListener).calledWithPartial({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    ...getTimeInfos(startTime, 2000)
                }
            });

            await timerTester.endTimer(enginePromise);
        });

        it('start with given startTime', async () => {

            const turnStartListener = jest.fn();

            const engine = createCycleEngine({
                charactersDurations: {
                    'foo': 2000,
                    'bar': 1000
                },
                charactersList: [ 'foo', 'bar' ],
                listeners: {
                    turnStart: turnStartListener
                }
            });

            const startTime = timerTester.now() + 12543;

            expect(engine.isStarted()).toEqual(false);

            const enginePromise = engine.start(startTime);

            expect(engine.isStarted()).toEqual(true);

            await timerTester.advance(12543, {
                runJustBeforeItEnds: () => {
                    expect(turnStartListener).not.toHaveBeenCalled();
                }
            });

            expectListener('turnStart', turnStartListener).calledWithPartial({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    ...getTimeInfos(startTime, 2000)
                }
            });

            await timerTester.endTimer(enginePromise);
        });
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
            charactersList: [ 'foo', 'bar', 'toto' ],
            listeners: {
                turnStart: turnStartListener,
                turnEnd: turnEndListener
            }
        });

        const enginePromise = engine.start();

        await timerTester.advance(8000);

        expect(turnStartListener).toHaveBeenCalled();

        const startTime = timerTester.now();

        const endFirstTurn = () => timerTester.advance(2000);

        return {
            engine,
            enginePromise,
            startTime,
            endFirstTurn,
            turnStartListener,
            turnEndListener
        };
    };

    describe('play next turn', () => {
        it('play next turn 4s after previous one', async () => {

            const {
                engine,
                enginePromise,
                endFirstTurn,
                turnStartListener
            } = await getStartedEngine();

            await endFirstTurn();

            turnStartListener.mockClear();

            const nextTurnPromise = engine.startNextTurn();

            const nextTurnStartTime = timerTester.now() + expectedDelays.betweenTurns;

            await timerTester.advance(expectedDelays.betweenTurns, {
                runJustBeforeItEnds: () => expect(turnStartListener).not.toHaveBeenCalled()
            });

            expectListener('turnStart', turnStartListener).calledWithPartial({
                currentTurn: {
                    turnIndex: 1,
                    characterIndex: 1,
                    characterId: 'bar',
                    ...getTimeInfos(nextTurnStartTime, 1000)
                }
            });

            await timerTester.endTimer(nextTurnPromise, enginePromise);
        });

        it('play next turn with given props', async () => {

            const {
                engine,
                enginePromise,
                endFirstTurn,
                turnStartListener
            } = await getStartedEngine();

            await endFirstTurn();

            turnStartListener.mockClear();

            const startTime = timerTester.now() + 12345;

            const nextTurnPromise = engine.startNextTurn({
                startTime,
                turnIndex: 6,
                roundIndex: 1,
                characterIndex: 2
            });

            await timerTester.advance(12345, {
                runJustBeforeItEnds: () => expect(turnStartListener).not.toHaveBeenCalled()
            });

            expectListener('turnStart', turnStartListener).calledWithPartial({
                currentTurn: {
                    turnIndex: 6,
                    characterIndex: 2,
                    characterId: 'toto',
                    ...getTimeInfos(startTime, 3000)
                },
                roundIndex: 1
            });

            await timerTester.endTimer(nextTurnPromise, enginePromise);
        });
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

            expectListener('turnEnd', turnEndListener).calledWithPartial({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    ...getTimeInfos(startTime, 2000),
                    endTimeDelta: 0
                }
            });

            await timerTester.endTimer(enginePromise);
        });

        it('change current turn duration after character duration changed', async () => {

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

            expectListener('turnEnd', turnEndListener).calledWithPartial({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    ...getTimeInfos(startTime, 3000),
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

            expectListener('turnEnd', turnEndListener).calledWithPartial({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    ...getTimeInfos(startTime, 1200),
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
                endFirstTurn,
                turnStartListener
            } = await getStartedEngine();

            await endFirstTurn();

            turnStartListener.mockClear();

            engine.disableCharacters([ 'bar' ]);

            const nextTurnPromise = engine.startNextTurn();
            await timerTester.triggerPromises();

            await timerTester.advance(expectedDelays.betweenTurns);

            const startTime = timerTester.now();

            expectListener('turnStart', turnStartListener).calledWithPartial({
                currentTurn: {
                    turnIndex: 1,
                    characterIndex: 2,
                    characterId: 'toto',
                    ...getTimeInfos(startTime, 3000),
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

            engine.disableCharacters([ 'foo' ]);

            await timerTester.triggerPromises();

            expectListener('turnEnd', turnEndListener).calledWithPartial({
                currentTurn: {
                    turnIndex: 0,
                    characterIndex: 0,
                    characterId: 'foo',
                    ...getTimeInfos(startTime, 2000),
                    endTimeDelta: -1500
                }
            });

            await timerTester.endTimer(enginePromise);
        });
    });

    describe('round management', () => {

        it('start battle with round 0', async () => {
            const {
                enginePromise,
                turnStartListener
            } = await getStartedEngine();

            expectListener('turnStart', turnStartListener).calledWithPartial({
                roundIndex: 0
            });

            await timerTester.endTimer(enginePromise);
        });

        it('play next round after last character played', async () => {
            const {
                engine,
                enginePromise,
                endFirstTurn,
                turnStartListener,
                turnEndListener
            } = await getStartedEngine();

            await endFirstTurn();

            await timerTester.waitTimer(engine.startNextTurn());

            turnStartListener.mockClear();
            turnEndListener.mockClear();

            await timerTester.waitTimer(engine.startNextTurn());

            expectListener('turnStart', turnStartListener).calledWithPartial({
                roundIndex: 0,
                lastRoundTurn: true
            });
            expectListener('turnEnd', turnEndListener).calledWithPartial({
                roundIndex: 0,
                lastRoundTurn: true
            });

            turnStartListener.mockClear();
            turnEndListener.mockClear();

            await timerTester.waitTimer(engine.startNextTurn());

            expectListener('turnStart', turnStartListener).calledWithPartial({
                roundIndex: 1,
                lastRoundTurn: false
            });
            expectListener('turnEnd', turnEndListener).calledWithPartial({
                roundIndex: 1,
                lastRoundTurn: false
            });

            await timerTester.endTimer(enginePromise);
        });

        it('change next round turn order', async () => {
            const {
                engine,
                enginePromise,
                endFirstTurn,
                turnStartListener
            } = await getStartedEngine();

            await endFirstTurn();

            await timerTester.waitTimer(engine.startNextTurn());
            await timerTester.waitTimer(engine.startNextTurn());

            turnStartListener.mockClear();

            engine.setTurnsOrder([ 'toto', 'bar', 'foo' ]);

            await timerTester.waitTimer(engine.startNextTurn());

            expectListener('turnStart', turnStartListener).calledWithPartial({
                currentTurn: expect.objectContaining<Partial<TurnInfos>>({
                    characterId: 'toto',
                    characterIndex: 0,
                    turnIndex: 3
                }),
                roundIndex: 1,
                lastRoundTurn: false
            });

            await timerTester.endTimer(enginePromise);
        });
    });

    describe('engine stop', () => {
        it('stops engine correctly', async () => {
            const {
                engine,
                enginePromise,
                turnEndListener
            } = await getStartedEngine();

            await timerTester.advance(400);

            await engine.stop();

            expectListener('turnEnd', turnEndListener).calledWithPartial({
                currentTurn: expect.objectContaining<Partial<TurnInfos>>({
                    characterId: 'foo',
                    characterIndex: 0,
                    turnIndex: 0
                }),
                roundIndex: 0,
                lastRoundTurn: false
            });

            await timerTester.endTimer(enginePromise);
        });
    });
});
