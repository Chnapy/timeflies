import { BattleLoadMessage } from '@timeflies/socket-messages';
import { createFakeBattle, createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../battle-service-test-utils';
import { joinBattleService } from './join-battle-service';

describe('join battle service', () => {

    describe('on battle-load message', () => {
        it('throw error if wrong battle id', () => {
            const battle = createFakeBattle();
            const socketCell = createFakeSocketCell();

            const service = joinBattleService(createFakeGlobalEntitiesNoService(battle));

            service.onSocketConnect(socketCell, 'p1');

            const listener = socketCell.getFirstListener(BattleLoadMessage);

            expect(() =>
                listener(BattleLoadMessage({
                    battleId: 'wrong-battle-id'
                }).get())
            ).toThrowError();
        });

        describe('if correct battle id', () => {
            it('response with battle load data', () => {
                const battle = createFakeBattle();
                const socketCell = createFakeSocketCell();

                const service = joinBattleService(createFakeGlobalEntitiesNoService(battle));

                service.onSocketConnect(socketCell, 'p1');

                const listener = socketCell.getFirstListener(BattleLoadMessage);

                const response = listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get());

                expect(response).toEqual(BattleLoadMessage.createResponse(expect.any(String), {
                    initialSerializableState: battle.getCurrentState(),
                    staticCharacters: battle.staticCharacters,
                    staticPlayers: battle.staticPlayers,
                    staticSpells: battle.staticSpells,
                    cycleInfos: battle.getCycleInfos(),
                    tiledMapInfos: battle.getMapInfos('toFrontend'),
                    myPlayerId: 'p1'
                }));
            });

            it('join player to battle', () => {
                
                const battle = createFakeBattle();
                const socketCell = createFakeSocketCell();

                const service = joinBattleService(createFakeGlobalEntitiesNoService(battle));

                service.onSocketConnect(socketCell, 'p1');

                const listener = socketCell.getFirstListener(BattleLoadMessage);

                listener(BattleLoadMessage({
                    battleId: 'battle'
                }).get());

                expect(battle.playerJoin).toHaveBeenCalledWith('p1');
            });
        });
    });
});
