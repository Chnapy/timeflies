import { ArrayUtils } from '@timeflies/common';
import { BattleEndMessage } from '@timeflies/socket-messages';
import { createFakeBattle, createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../battle-service-test-utils';
import { EndBattleService } from './end-battle-service';

describe('end battle service', () => {

    describe('is battle ended function', () => {
        it('does not consider battle as ended if remaining at least 2 teams alive', () => {
            const battle = createFakeBattle();
            const globalEntitiesNoServices = createFakeGlobalEntitiesNoService(battle);
            const service = new EndBattleService(globalEntitiesNoServices);

            expect(service.isBattleEnded({
                characters: {
                    health: { c1: 0, c2: 100, c3: 100 },
                } as any
            }, battle.staticState)).toEqual(null);
        });

        it('consider battle as ended if remaining only 1 team alive', () => {
            const battle = createFakeBattle();
            const globalEntitiesNoServices = createFakeGlobalEntitiesNoService(battle);
            const service = new EndBattleService(globalEntitiesNoServices);

            expect(service.isBattleEnded({
                characters: {
                    health: { c1: 0, c2: 100, c3: 0 },
                } as any
            }, battle.staticState)).toEqual('#00FF00');
        });
    });

    describe('on battle end', () => {
        it('send end-battle message to every players', () => {
            const battle = createFakeBattle();
            const globalEntitiesNoServices = createFakeGlobalEntitiesNoService(battle);
            const service = new EndBattleService(globalEntitiesNoServices);

            const playerList = ArrayUtils.range(3).map(i => {
                const socketCell = createFakeSocketCell();
                const playerId = 'p' + i;
                service.onSocketConnect(socketCell, playerId);
                return { socketCell, playerId };
            });

            service.onBattleEnd('#00FF00', 12);

            for (const { socketCell } of playerList) {
                expect(socketCell.send).toHaveBeenCalledWith(BattleEndMessage({
                    winnerTeamColor: '#00FF00',
                    endTime: 12
                }));
            }
        });
    });
});
