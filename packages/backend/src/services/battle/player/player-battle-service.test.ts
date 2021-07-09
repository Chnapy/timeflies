import { timerTester } from '@timeflies/devtools';
import { BattleLoadMessage, BattlePlayerDisconnectMessage, BattlePlayerDisconnectRemoveMessage } from '@timeflies/socket-messages';
import { produceStateDisconnectedPlayers } from '@timeflies/spell-effects';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../../service-test-utils';
import { createFakeBattle } from '../battle-service-test-utils';
import { PlayerBattleService } from './player-battle-service';

describe('player battle service', () => {

    describe('on player disconnect', () => {

        it('does nothing if not in battle', () => {
            const socketCell = createFakeSocketCell();

            const service = new PlayerBattleService(createFakeGlobalEntitiesNoService());

            service.onSocketConnect(socketCell, 'p1');

            expect(socketCell.getDisconnectListener()).not.toThrowError();
        });

        it('add player to disconnected players', () => {
            const battle = createFakeBattle();
            const socketCell = createFakeSocketCell();

            const service = new PlayerBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

            service.onSocketConnect(socketCell, 'p1');

            socketCell.getDisconnectListener()!();

            expect(battle.playerDisconnect).toHaveBeenCalledWith('p1');
        });

        it('send player disconnect message to other players', () => {
            const battle = createFakeBattle();
            const socketCellP1 = createFakeSocketCell();
            const socketCellP2 = createFakeSocketCell();

            const service = new PlayerBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

            service.onSocketConnect(socketCellP1, 'p1');
            service.onSocketConnect(socketCellP2, 'p2');

            socketCellP1.getDisconnectListener()!();

            expect(socketCellP2.send).toHaveBeenCalledWith(BattlePlayerDisconnectMessage({ playerId: 'p1' }))
        });
    });

    describe('on battle-load message', () => {
        it('throw error if wrong battle id', async () => {
            const battle = createFakeBattle();
            const socketCell = createFakeSocketCell();

            const service = new PlayerBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

            service.onSocketConnect(socketCell, 'p1');

            const listener = socketCell.getFirstListener(BattleLoadMessage);

            await expect(
                listener(BattleLoadMessage({
                    battleId: 'wrong-battle-id'
                }).get(), socketCell.send)
            ).rejects.toBeDefined();
        });

        describe('if correct battle id', () => {
            it('response with battle load data', async () => {
                const battle = createFakeBattle();
                const socketCell = createFakeSocketCell();

                const service = new PlayerBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

                service.onSocketConnect(socketCell, 'p1');

                const listener = socketCell.getFirstListener(BattleLoadMessage);

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCell.send));

                expect(socketCell.send).toHaveBeenCalledWith(BattleLoadMessage.createResponse(expect.any(String), {
                    roomId: battle.roomId,
                    initialSerializableState: battle.getCurrentState(),
                    staticCharacters: battle.staticCharacters,
                    staticPlayers: battle.staticPlayers,
                    staticSpells: battle.staticSpells,
                    cycleInfos: battle.getCycleInfos(),
                    tiledMapInfos: battle.getMapInfos('toFrontend')
                }));
            });

            it('join player to battle, after responding', async () => {

                const battle = createFakeBattle();
                const socketCell = createFakeSocketCell();

                const service = new PlayerBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

                const callOrder: string[] = [];

                battle.playerJoin = jest.fn(async () => { callOrder.push('playerJoin') });
                socketCell.send = jest.fn(() => callOrder.push('response'));

                service.onSocketConnect(socketCell, 'p1');

                const listener = socketCell.getFirstListener(BattleLoadMessage);

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCell.send));

                expect(battle.playerJoin).toHaveBeenCalledWith('p1');

                expect(callOrder).toEqual([ 'playerJoin', 'response']);
            });

            it('add player to global battle map', async () => {
                const battle = createFakeBattle();
                const socketCell = createFakeSocketCell();

                const globalEntities = createFakeGlobalEntitiesNoService(undefined, battle);

                delete globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ];

                const service = new PlayerBattleService(globalEntities);

                service.onSocketConnect(socketCell, 'p1');

                const listener = socketCell.getFirstListener(BattleLoadMessage);

                await timerTester.endTimer(listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCell.send));

                expect(globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ]).toBe(battle);
            });
        });
    });

    describe('check disconnected players', () => {

        it('remove players disconnected for 30+ seconds from battle', async () => {
            const battle = createFakeBattle();
            const socketCell = createFakeSocketCell();

            const service = new PlayerBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

            service.onSocketConnect(socketCell, 'p1');

            battle.disconnectedPlayers = {
                'p2': timerTester.now() - 31_000,
                'p3': timerTester.now() - 29_000
            };

            await service.checkLeavedAndDisconnectedPlayers(battle.battleId);

            expect(battle.disconnectedPlayers).toEqual({
                'p3': timerTester.now() - 29_000
            });
        });

        it('add new state with removed players characters dead', async () => {
            const battle = createFakeBattle();
            const socketCell = createFakeSocketCell();

            const service = new PlayerBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

            service.onSocketConnect(socketCell, 'p1');

            battle.disconnectedPlayers = {
                'p2': timerTester.now() - 31_000
            };

            const expectedState = produceStateDisconnectedPlayers(
                battle.getCurrentState(),
                Date.now(),
                [ 'p2' ],
                battle.staticCharacters.reduce<any>((acc, { characterId, playerId }) => {
                    acc[ characterId ] = playerId;
                    return acc;
                }, {})
            );

            await service.checkLeavedAndDisconnectedPlayers(battle.battleId);

            expect(battle.addNewState).toHaveBeenCalledWith(expectedState, timerTester.now());
        });

        it('send players to remove to other players', async () => {
            const battle = createFakeBattle();
            const socketCellP1 = createFakeSocketCell();
            const socketCellP2 = createFakeSocketCell();

            const service = new PlayerBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

            service.onSocketConnect(socketCellP1, 'p1');
            service.onSocketConnect(socketCellP2, 'p2');

            battle.disconnectedPlayers = {
                'p2': timerTester.now() - 31_000
            };

            await service.checkLeavedAndDisconnectedPlayers(battle.battleId);

            expect(socketCellP1.send).toHaveBeenCalledWith(BattlePlayerDisconnectRemoveMessage({
                playersToRemove: [ 'p2' ],
                time: timerTester.now()
            }));
        });
    });
});
