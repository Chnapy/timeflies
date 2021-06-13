import { BattleLoadMessage } from '@timeflies/socket-messages';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../../service-test-utils';
import { createFakeBattle } from '../battle-service-test-utils';
import { JoinBattleService } from './join-battle-service';

describe('join battle service', () => {

    describe('on battle-load message', () => {
        it('throw error if wrong battle id', () => {
            const battle = createFakeBattle();
            const socketCell = createFakeSocketCell();

            const service = new JoinBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

            service.onSocketConnect(socketCell, 'p1');

            const listener = socketCell.getFirstListener(BattleLoadMessage);

            expect(() =>
                listener(BattleLoadMessage({
                    battleId: 'wrong-battle-id'
                }).get(), socketCell.send)
            ).toThrowError();
        });

        describe('if correct battle id', () => {
            it('response with battle load data', async () => {
                const battle = createFakeBattle();
                const socketCell = createFakeSocketCell();

                const service = new JoinBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

                service.onSocketConnect(socketCell, 'p1');

                const listener = socketCell.getFirstListener(BattleLoadMessage);

                await listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCell.send);

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

                const service = new JoinBattleService(createFakeGlobalEntitiesNoService(undefined, battle));

                const callOrder: string[] = [];

                battle.playerJoin = jest.fn(() => callOrder.push('playerJoin'));
                socketCell.send = jest.fn(() => callOrder.push('response'));

                service.onSocketConnect(socketCell, 'p1');

                const listener = socketCell.getFirstListener(BattleLoadMessage);

                await listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCell.send);

                expect(battle.playerJoin).toHaveBeenCalledWith('p1');

                expect(callOrder).toEqual([ 'response', 'playerJoin' ]);
            });

            it('add player to global battle map', async () => {
                const battle = createFakeBattle();
                const socketCell = createFakeSocketCell();

                const globalEntities = createFakeGlobalEntitiesNoService(undefined, battle);

                delete globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ];

                const service = new JoinBattleService(globalEntities);

                service.onSocketConnect(socketCell, 'p1');

                const listener = socketCell.getFirstListener(BattleLoadMessage);

                await listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get(), socketCell.send);

                expect(globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ]).toBe(battle);
            });
        });
    });
});
