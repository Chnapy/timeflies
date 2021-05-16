import { PlayerId } from '@timeflies/common';
import { BattleLoadMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { createService } from '../../service';
import { BattleId } from '../battle';

export const joinBattleService = createService(({ currentBattleMap }) => {

    const getBattle = (battleId: BattleId) => {
        const battle = currentBattleMap.mapById[ battleId ];
        if (!battle) {
            throw new SocketError(400, 'battle id does not exist: ' + battleId);
        }

        return battle;
    };

    const addBattleLoadMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener<typeof BattleLoadMessage>(BattleLoadMessage, ({ payload, requestId }) => {
        const battle = getBattle(payload.battleId);

        const { staticPlayers, staticCharacters, staticSpells, getCurrentState, getMapInfos, getCycleInfos } = battle;

        battle.playerJoin(currentPlayerId);

        return BattleLoadMessage.createResponse(requestId, {
            tiledMapInfos: getMapInfos('toFrontend'),
            staticPlayers,
            staticCharacters,
            staticSpells,
            initialSerializableState: getCurrentState(),
            cycleInfos: getCycleInfos(),

            myPlayerId: currentPlayerId
        });
    });

    return {
        onSocketConnect: (socketCell, currentPlayerId) => {

            addBattleLoadMessageListener(socketCell, currentPlayerId);
        }
    };
});
