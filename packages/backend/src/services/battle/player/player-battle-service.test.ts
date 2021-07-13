import { ArrayUtils } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { BattleLeaveMessage, BattleLoadMessage, BattlePlayerDisconnectMessage, BattlePlayerDisconnectRemoveMessage } from '@timeflies/socket-messages';
import { produceStateDisconnectedPlayers } from '@timeflies/spell-effects';
import { assetUrl } from '../../../utils/asset-url';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../../service-test-utils';
import { createServices } from '../../services';
import { createFakeBattle } from '../battle-service-test-utils';
import { PlayerBattleService } from './player-battle-service';

describe('player battle service', () => {

    const getEntities = () => {
        const battle = createFakeBattle();
        const socketCellP1 = createFakeSocketCell();

        const globalEntities = createFakeGlobalEntitiesNoService(undefined, battle);
        const service = new PlayerBattleService(globalEntities);
        service.services = createServices(globalEntities);

        return {
            battle,
            socketCellP1,
            globalEntities,
            service,
            connect: () => service.onSocketConnect(socketCellP1, 'p1')
        };
    };

    describe('on player disconnect', () => {

        it('does nothing if not in battle', () => {
            const socketCell = createFakeSocketCell();

            const service = new PlayerBattleService(createFakeGlobalEntitiesNoService());

            service.onSocketConnect(socketCell, 'p1');

            expect(socketCell.getDisconnectListener()).not.toThrowError();
        });

        it('add player to disconnected players', () => {
            const { battle, socketCellP1, connect } = getEntities();

            connect();

            socketCellP1.getDisconnectListener()!();

            expect(battle.disconnectedPlayers).toEqual({ 'p1': Date.now() });
        });

        it('send player disconnect message to other players', () => {
            const { socketCellP1, service, connect } = getEntities();
            const socketCellP2 = createFakeSocketCell();

            connect();
            service.onSocketConnect(socketCellP2, 'p2');

            socketCellP1.getDisconnectListener()!();

            expect(socketCellP2.send).toHaveBeenCalledWith(BattlePlayerDisconnectMessage({ playerId: 'p1' }))
        });

        it('remove spectator if any', () => {
            const { battle, socketCellP1, connect } = getEntities();

            battle.staticPlayers = [
                {
                    playerId: 'p1',
                    playerName: '',
                    teamColor: '#FFF',
                    type: 'spectator'
                }
            ];
            battle.playerIdList = new Set([ 'p1' ]);
            battle.staticState.players[ 'p1' ] = battle.staticPlayers[ 0 ];

            connect();

            socketCellP1.getDisconnectListener()!();

            expect(battle.staticPlayers).toEqual([]);
            expect(battle.playerIdList.size).toEqual(0);
            expect(battle.staticState.players[ 'p1' ]).toBeUndefined();
        });
    });

    describe('on battle-load message', () => {
        it('throw error if wrong battle id', async () => {
            const { socketCellP1, connect } = getEntities();

            connect();

            const listener = socketCellP1.getFirstListener(BattleLoadMessage);

            await expect(
                listener(BattleLoadMessage({
                    battleId: 'wrong-battle-id'
                }).get(), socketCellP1.send)
            ).rejects.toBeDefined();
        });

        describe('if correct battle id', () => {
            it('join player to battle', async () => {
                const { battle, socketCellP1, connect } = getEntities();

                connect();

                const listener = socketCellP1.getFirstListener(BattleLoadMessage);

                battle.waitingPlayerList = new Set([ 'p1' ]);
                battle.disconnectedPlayers = { 'p1': Date.now() };
                battle.leavedPlayers = new Set([ 'p1' ]);

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCellP1.send));

                expect(battle.waitingPlayerList.size).toEqual(0);
                expect(battle.disconnectedPlayers).toEqual({});
                expect(battle.leavedPlayers.size).toEqual(0);
            });

            it('add player to global battle map', async () => {
                const { battle, socketCellP1, globalEntities, connect } = getEntities();

                delete globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ];

                connect();

                const listener = socketCellP1.getFirstListener(BattleLoadMessage);

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCellP1.send));

                expect(globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ]).toBe(battle);
            });

            it('response with battle load data', async () => {
                const { battle, socketCellP1, connect } = getEntities();

                connect();

                const listener = socketCellP1.getFirstListener(BattleLoadMessage);

                battle.mapInfos.imagesLinks = { 'foo': 'bar' }

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCellP1.send));

                expect(socketCellP1.send).toHaveBeenCalledWith(BattleLoadMessage.createResponse(expect.any(String), {
                    roomId: battle.roomId,
                    initialSerializableState: battle.stateStack[ 0 ],
                    staticCharacters: battle.staticCharacters,
                    staticPlayers: battle.staticPlayers,
                    staticSpells: battle.staticSpells,
                    cycleInfos: battle.cycleInfos,
                    tiledMapInfos: {
                        name: '',
                        schemaLink: assetUrl.toFrontend(''),
                        imagesLinks: { 'foo': assetUrl.toFrontend('bar') }
                    }
                }));
            });

            it('add spectator if any', async () => {
                const { battle, socketCellP1, connect } = getEntities();

                battle.staticPlayers = [];
                battle.playerIdList = new Set();
                delete battle.staticState.players[ 'p1' ];

                connect();

                const listener = socketCellP1.getFirstListener(BattleLoadMessage);

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCellP1.send));

                expect(battle.staticPlayers).toEqual([
                    {
                        playerId: 'p1',
                        playerName: 'p-1',
                        teamColor: null,
                        type: 'spectator'
                    }
                ]);
                expect(battle.playerIdList.has('p1')).toBeTruthy();
                expect(battle.staticState.players[ 'p1' ]).toEqual({
                    playerId: 'p1',
                    playerName: 'p-1',
                    teamColor: null,
                    type: 'spectator'
                });
            });

            it('do not start battle if waiting players not present', async () => {
                const { battle, socketCellP1, connect } = getEntities();

                battle.waitingPlayerList = new Set([ 'p1', 'p2' ]);

                connect();

                const listener = socketCellP1.getFirstListener(BattleLoadMessage);

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCellP1.send));

                expect(battle.cycleRunning).toBe(false);
            });

            it('do not start battle if cycle engine already launched', async () => {
                const { battle, socketCellP1, connect } = getEntities();

                battle.cycleEngine.isStarted = () => true;

                connect();

                const listener = socketCellP1.getFirstListener(BattleLoadMessage);

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCellP1.send));

                expect(battle.cycleRunning).toBe(false);
            });

            it('start battle otherwise', async () => {
                const { battle, socketCellP1, connect } = getEntities();

                battle.waitingPlayerList = new Set([ 'p1' ]);
                battle.cycleEngine.isStarted = () => false;

                connect();

                const listener = socketCellP1.getFirstListener(BattleLoadMessage);

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCellP1.send));

                expect(battle.cycleRunning).toBe(true);
            });
        });
    });

    describe('on battle leave message', () => {

        it('does nothing if no battle', async () => {
            const { socketCellP1, connect, globalEntities } = getEntities();

            globalEntities.currentBattleMap.mapById = {};
            globalEntities.currentBattleMap.mapByPlayerId = {};

            connect();

            const listener = socketCellP1.getFirstListener(BattleLeaveMessage);

            await expect(listener(BattleLeaveMessage({}), socketCellP1.send)).resolves.toBeUndefined();
        });

        it('remove player from global map', async () => {
            const { socketCellP1, connect, globalEntities } = getEntities();

            connect();

            const listener = socketCellP1.getFirstListener(BattleLeaveMessage);

            await listener(BattleLeaveMessage({}), socketCellP1.send);

            expect(globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ]).toBeUndefined();
        });

        it('add player to leaved players', async () => {
            const { socketCellP1, connect, battle } = getEntities();

            connect();

            const listener = socketCellP1.getFirstListener(BattleLeaveMessage);

            await listener(BattleLeaveMessage({}), socketCellP1.send);

            expect(battle.leavedPlayers.has('p1')).toBeTruthy();
        });

        it('remove spectator if any', async () => {
            const { battle, socketCellP1, connect } = getEntities();

            battle.staticPlayers = [
                {
                    playerId: 'p1',
                    playerName: '',
                    teamColor: '#FFF',
                    type: 'spectator'
                }
            ];
            battle.playerIdList = new Set([ 'p1' ]);
            battle.staticState.players[ 'p1' ] = battle.staticPlayers[ 0 ];

            connect();

            const listener = socketCellP1.getFirstListener(BattleLeaveMessage);

            await listener(BattleLeaveMessage({}), socketCellP1.send);

            expect(battle.staticPlayers).toEqual([]);
            expect(battle.playerIdList.size).toEqual(0);
            expect(battle.staticState.players[ 'p1' ]).toBeUndefined();
        });
    });

    describe('check disconnected players', () => {

        it('remove players disconnected for 30+ seconds from battle', async () => {
            const { battle, service, connect } = getEntities();

            connect();

            battle.disconnectedPlayers = {
                'p2': timerTester.now() - 31_000,
                'p3': timerTester.now() - 29_000
            };

            await timerTester.endTimer(
                service.checkLeavedAndDisconnectedPlayers(battle.battleId)
            );

            expect(battle.disconnectedPlayers).toEqual({
                'p3': timerTester.now() - 29_000
            });
        });

        it('add new state with removed players characters dead', async () => {
            const { battle, service, connect } = getEntities();

            connect();

            battle.disconnectedPlayers = {
                'p2': timerTester.now() - 31_000
            };

            const expectedState = produceStateDisconnectedPlayers(
                battle.stateStack[ 0 ],
                Date.now(),
                [ 'p2' ],
                battle.staticCharacters.reduce<any>((acc, { characterId, playerId }) => {
                    acc[ characterId ] = playerId;
                    return acc;
                }, {})
            );

            await timerTester.endTimer(
                service.checkLeavedAndDisconnectedPlayers(battle.battleId)
            );

            expect(ArrayUtils.last(battle.stateStack)).toEqual(expectedState);
        });

        it('send players to remove to other players', async () => {
            const { battle, socketCellP1, service, connect } = getEntities();
            const socketCellP2 = createFakeSocketCell();

            connect();

            service.onSocketConnect(socketCellP2, 'p2');

            battle.disconnectedPlayers = {
                'p2': timerTester.now() - 31_000
            };

            await timerTester.endTimer(
                service.checkLeavedAndDisconnectedPlayers(battle.battleId)
            );

            expect(socketCellP1.send).toHaveBeenCalledWith(BattlePlayerDisconnectRemoveMessage({
                playersToRemove: [ 'p2' ],
                time: timerTester.now()
            }));
        });
    });
});
