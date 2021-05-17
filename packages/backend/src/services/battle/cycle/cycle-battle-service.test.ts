import { ArrayUtils } from '@timeflies/common';
import { NextTurnInfos } from '@timeflies/cycle-engine';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import { createFakeBattle, createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../battle-service-test-utils';
import { cycleBattleService } from './cycle-battle-service';

describe('cycle battle service', () => {

    it('before turn start, send turn start infos to every players', () => {
        const battle = createFakeBattle();

        const service = cycleBattleService(createFakeGlobalEntitiesNoService(battle));

        const playerList = ArrayUtils.range(3).map(i => {
            const socketCell = createFakeSocketCell();
            const playerId = 'p' + i;

            service.onSocketConnect(socketCell, playerId);

            return { socketCell, playerId };
        });

        const turnInfos: NextTurnInfos = {
            characterId: 'c1',
            roundIndex: 1,
            startTime: 12,
            turnIndex: 1
        };

        service.beforeTurnStart(
            turnInfos,
            playerList.map(p => p.playerId)
        );

        for (const { socketCell } of playerList) {
            expect(socketCell.send).toHaveBeenCalledWith(BattleTurnStartMessage(turnInfos));
        }
    });

});
