import { ArrayUtils } from '@timeflies/common';
import { CycleEngine, CycleEngineListeners, TurnInfos } from '@timeflies/cycle-engine';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../../service-test-utils';
import { createFakeBattle } from '../battle-service-test-utils';
import { CycleBattleService } from './cycle-battle-service';

describe('cycle battle service', () => {

    describe('create cycle engine overlay', () => {

        const getCycleEngineOverlay = () => {
            const battle = createFakeBattle();

            const service = new CycleBattleService(createFakeGlobalEntitiesNoService(undefined, battle));
            service.services = {
                playerBattleService: { checkDisconnectedPlayers: jest.fn() }
            } as any;

            const playerList = ArrayUtils.range(3).map(i => {
                const socketCell = createFakeSocketCell();
                const playerId = 'p' + i;

                service.onSocketConnect(socketCell, playerId);

                return { socketCell, playerId };
            });

            const cycleEngine: CycleEngine = {
                start: jest.fn(),
                stop: jest.fn(),
                isStarted: jest.fn(),
                disableCharacters: jest.fn(),
                getNextTurnInfos: jest.fn(() => ({
                    characterId: 'c1',
                    roundIndex: 0,
                    turnIndex: 0,
                    startTime: 12
                })),
                startNextTurn: jest.fn(),
                setCharacterDuration: jest.fn(),
                setTurnsOrder: jest.fn()
            };

            let listeners: CycleEngineListeners = null as any;

            const cycleEngineOverlay = service.createCycleEngineOverlay({
                battleId: 'battle',
                playerIdList: new Set(playerList.map(p => p.playerId)),
                charactersList: [ 'c1', 'c2', 'c3' ],
                charactersDurations: { c1: 100, c2: 100, c3: 100 }
            }, ({ listeners: _listeners }) => {
                listeners = _listeners;
                return cycleEngine;
            });

            return { cycleEngineOverlay, cycleEngine, listeners, playerList };
        };

        describe('isStarted()', () => {
            it('gives cycle engine state', () => {
                const { cycleEngineOverlay, cycleEngine } = getCycleEngineOverlay();

                cycleEngine.isStarted = jest.fn(() => 'foo' as any);
                expect(cycleEngineOverlay.isStarted()).toEqual('foo');
            });
        });

        describe('start()', () => {

            it('start cycle engine', async () => {
                const { cycleEngineOverlay, cycleEngine } = getCycleEngineOverlay();

                await cycleEngineOverlay.start();

                expect(cycleEngine.start).toHaveBeenCalled();
            });

            it('send turn infos to every players', async () => {
                const { cycleEngineOverlay, cycleEngine, playerList } = getCycleEngineOverlay();

                cycleEngine.getNextTurnInfos = jest.fn(() => ({
                    characterId: 'c1',
                    roundIndex: 0,
                    turnIndex: 0,
                    startTime: 12
                }));

                await cycleEngineOverlay.start();

                for (const { socketCell } of playerList) {
                    expect(socketCell.send).toHaveBeenCalledWith(BattleTurnStartMessage({
                        characterId: 'c1',
                        roundIndex: 0,
                        turnIndex: 0,
                        startTime: 12
                    }));
                }
            });

            it('set running as true', async () => {
                const { cycleEngineOverlay } = getCycleEngineOverlay();

                await cycleEngineOverlay.start();

                expect(cycleEngineOverlay.isRunning()).toEqual(true);
            });
        });

        describe('stop()', () => {

            it('stop cycle engine', async () => {
                const { cycleEngineOverlay, cycleEngine } = getCycleEngineOverlay();

                await cycleEngineOverlay.start();
                await cycleEngineOverlay.stop();

                expect(cycleEngine.stop).toHaveBeenCalled();
            });

            it('set running as false', async () => {
                const { cycleEngineOverlay } = getCycleEngineOverlay();

                await cycleEngineOverlay.start();
                await cycleEngineOverlay.stop();

                expect(cycleEngineOverlay.isRunning()).toEqual(false);
            });
        });

        describe('getCurrentTurnInfos()', () => {
            it('gives turn infos of last turn start', async () => {
                const { cycleEngineOverlay, listeners } = getCycleEngineOverlay();

                listeners.turnStart!({
                    roundIndex: 3,
                    lastRoundTurn: false,
                    currentTurn: {
                        characterId: 'c2',
                        characterIndex: 2,
                        duration: 12,
                        endTime: 45,
                        startTime: 8,
                        turnIndex: 1
                    }
                });

                expect(cycleEngineOverlay.getCurrentTurnInfos()).toEqual<TurnInfos>({
                    characterId: 'c2',
                    characterIndex: 2,
                    duration: 12,
                    endTime: 45,
                    startTime: 8,
                    turnIndex: 1
                });

                listeners.turnStart!({
                    roundIndex: 3,
                    lastRoundTurn: false,
                    currentTurn: {
                        characterId: 'c3',
                        characterIndex: 3,
                        duration: 89,
                        endTime: 87,
                        startTime: 105,
                        turnIndex: 2
                    }
                });

                expect(cycleEngineOverlay.getCurrentTurnInfos()).toEqual<TurnInfos>({
                    characterId: 'c3',
                    characterIndex: 3,
                    duration: 89,
                    endTime: 87,
                    startTime: 105,
                    turnIndex: 2
                });
            });
        });

        describe('onNewState()', () => {
            it('disable all dead characters', async () => {
                const { cycleEngineOverlay, cycleEngine } = getCycleEngineOverlay();

                cycleEngineOverlay.onNewState({
                    characters: {
                        health: { c1: 0, c2: 5, c3: 0 },
                        actionTime: {},
                        orientation: {},
                        position: {}
                    }
                });

                expect(cycleEngine.disableCharacters).toHaveBeenCalledWith([ 'c1', 'c3' ]);
            });
        });

        describe('on turn end', () => {
            it('before next turn, send turn start infos to every players', async () => {
                const { cycleEngineOverlay, cycleEngine, listeners, playerList } = getCycleEngineOverlay();

                await cycleEngineOverlay.start();

                cycleEngine.getNextTurnInfos = jest.fn(() => ({
                    characterId: 'c2',
                    roundIndex: 3,
                    startTime: 8,
                    turnIndex: 1
                }));

                await listeners.turnEnd!({
                    roundIndex: 3,
                    lastRoundTurn: false,
                    currentTurn: {
                        characterId: 'c2',
                        characterIndex: 2,
                        duration: 12,
                        endTime: 45,
                        startTime: 8,
                        turnIndex: 1,
                        endTimeDelta: 8
                    }
                });

                for (const { socketCell } of playerList) {
                    expect(socketCell.send).toHaveBeenCalledWith(BattleTurnStartMessage({
                        characterId: 'c2',
                        roundIndex: 3,
                        startTime: 8,
                        turnIndex: 1
                    }));
                }
            });
        });
    });
});
