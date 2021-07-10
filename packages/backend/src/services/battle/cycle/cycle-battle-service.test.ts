import { CycleEngine, CycleEngineListeners, TurnInfos } from '@timeflies/cycle-engine';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../../service-test-utils';
import { createServices } from '../../services';
import { createFakeBattle } from '../battle-service-test-utils';
import { CycleBattleService } from './cycle-battle-service';

describe('cycle battle service', () => {

    describe('create cycle engine overlay', () => {

        const getCycleEngineOverlay = () => {
            const battle = createFakeBattle();

            const globalEntities = createFakeGlobalEntitiesNoService(undefined, battle);
            const service = new CycleBattleService(globalEntities);
            service.services = createServices(globalEntities);

            const playerList = battle.staticPlayers.map(({ playerId }) => {
                const socketCell = createFakeSocketCell();
                service.onSocketConnect(socketCell, playerId);

                return { socketCell, playerId };
            });

            const expectedCycleEngine: CycleEngine = {
                start: jest.fn(),
                stop: jest.fn(),
                isStarted: jest.fn(() => false),
                disableCharacters: jest.fn(),
                getNextTurnInfos: jest.fn(() => ({ characterId: 'c1', roundIndex: 0, startTime: Date.now(), turnIndex: 0 })),
                setCharacterDuration: jest.fn(),
                setTurnsOrder: jest.fn(),
                startNextTurn: jest.fn(async () => { }),
            };

            return { battle, service, playerList, expectedCycleEngine };
        };

        describe('start cycle', () => {

            it('start cycle engine', async () => {
                const { battle, service } = getCycleEngineOverlay();

                await service.start(battle);

                expect(battle.cycleEngine.start).toHaveBeenCalled();
            });

            it('send turn infos to every players', async () => {
                const { battle, service, playerList } = getCycleEngineOverlay();

                await service.start(battle);

                for (const { socketCell } of playerList) {
                    expect(socketCell.send).toHaveBeenCalledWith(BattleTurnStartMessage({
                        characterId: 'c1', roundIndex: 0, startTime: Date.now(), turnIndex: 0
                    }));
                }
            });

            it('set battle running as true', async () => {
                const { battle, service } = getCycleEngineOverlay();

                await service.start(battle);

                expect(battle.cycleRunning).toEqual(true);
            });
        });

        describe('stop cycle', () => {

            it('stop cycle engine', async () => {
                const { service, battle } = getCycleEngineOverlay();

                await service.start(battle);
                await service.stop(battle);

                expect(battle.cycleEngine.stop).toHaveBeenCalled();
            });

            it('set running as false', async () => {
                const { service, battle } = getCycleEngineOverlay();

                await service.start(battle);
                await service.stop(battle);

                expect(battle.cycleRunning).toEqual(false);
            });
        });

        it('set battle turn infos of last turn start', async () => {
            const { battle, service, expectedCycleEngine } = getCycleEngineOverlay();

            let listeners: CycleEngineListeners = null as any;
            const cycleEngine = service.createCycleEngine(battle, params => {
                listeners = params.listeners;

                return expectedCycleEngine;
            });

            expect(cycleEngine).toBe(expectedCycleEngine);

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

            expect(battle.currentTurnInfos).toEqual<TurnInfos>({
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

            expect(battle.currentTurnInfos).toEqual<TurnInfos>({
                characterId: 'c3',
                characterIndex: 3,
                duration: 89,
                endTime: 87,
                startTime: 105,
                turnIndex: 2
            });
        });

        describe('on new state', () => {
            it('disable all dead characters', async () => {
                const { battle, service } = getCycleEngineOverlay();

                service.onNewState(battle, {
                    characters: {
                        health: { c1: 0, c2: 5, c3: 0 },
                        actionTime: {},
                        orientation: {},
                        position: {}
                    }
                });

                expect(battle.cycleEngine.disableCharacters).toHaveBeenCalledWith([ 'c1', 'c3' ]);
            });
        });

        describe('on turn end', () => {
            it('before next turn, send turn start infos to every players', async () => {
                const { battle, service, playerList, expectedCycleEngine } = getCycleEngineOverlay();

                let listeners: CycleEngineListeners = null as any;
                battle.cycleEngine = service.createCycleEngine(battle, params => {
                    listeners = params.listeners;

                    return expectedCycleEngine;
                });

                battle.cycleRunning = true;
                battle.cycleEngine.getNextTurnInfos = () => ({
                    characterId: 'c2',
                    roundIndex: 3,
                    startTime: 8,
                    turnIndex: 1
                });

                await listeners.turnEnd!({
                    roundIndex: 3,
                    lastRoundTurn: false,
                    currentTurn: {
                        characterId: 'c2',
                        startTime: 8,
                        turnIndex: 1,
                        characterIndex: 2,
                        duration: 12,
                        endTime: 45,
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
