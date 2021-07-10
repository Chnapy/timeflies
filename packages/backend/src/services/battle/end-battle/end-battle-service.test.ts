import { BattleEndMessage } from '@timeflies/socket-messages';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../../service-test-utils';
import { createServices } from '../../services';
import { createFakeBattle } from '../battle-service-test-utils';
import { EndBattleService } from './end-battle-service';

describe('end battle service', () => {

    const getEntities = () => {
        const battle = createFakeBattle();
        const globalEntitiesNoServices = createFakeGlobalEntitiesNoService(undefined, battle);
        const service = new EndBattleService(globalEntitiesNoServices);
        service.services = createServices(globalEntitiesNoServices);

        return { battle, globalEntitiesNoServices, service };
    };

    describe('is battle ended function', () => {
        it('does not consider battle as ended if remaining at least 2 teams alive', () => {
            const { battle, service } = getEntities();

            expect(service.isBattleEnded({
                characters: {
                    health: { c1: 0, c2: 100, c3: 100 },
                } as any
            }, battle.staticState)).toEqual(null);
        });

        it('consider battle as ended if remaining only 1 team alive', () => {
            const { battle, service } = getEntities();

            expect(service.isBattleEnded({
                characters: {
                    health: { c1: 0, c2: 100, c3: 0 },
                } as any
            }, battle.staticState)).toEqual('#00FF00');
        });
    });

    describe('on battle end', () => {
        it('send end-battle message to every players', async () => {
            const { battle, service } = getEntities();

            const playerList = battle.staticPlayers.map(({ playerId }) => {
                const socketCell = createFakeSocketCell();
                service.onSocketConnect(socketCell, playerId);
                return { socketCell, playerId };
            });

            await service.onBattleEnd(battle, '#00FF00', 12);

            for (const { socketCell } of playerList) {
                expect(socketCell.send).toHaveBeenCalledWith(BattleEndMessage({
                    winnerTeamColor: '#00FF00',
                    endTime: 12
                }));
            }
        });

        it('remove players from global battle map', async () => {
            const { battle, globalEntitiesNoServices, service } = getEntities();

            const playerList = battle.staticPlayers.map(({ playerId }) => {
                const socketCell = createFakeSocketCell();
                service.onSocketConnect(socketCell, playerId);
                return { socketCell, playerId };
            });

            await service.onBattleEnd(battle, '#00FF00', 12);

            for (const { playerId } of playerList) {
                expect(globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ playerId ]).toBeUndefined();
            }
        });
    });
});
