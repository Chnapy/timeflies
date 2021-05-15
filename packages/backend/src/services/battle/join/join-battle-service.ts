import { PlayerId } from '@timeflies/common';
import { BattleLoadMessage } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { createService } from '../../service';
import { BattleId } from '../battle';

export const joinBattleService = createService(({ currentBattleMap }) => {

    const getBattle = (battleId: BattleId) => {
        const battle = currentBattleMap[ battleId ];
        if (!battle) {
            throw new Error('battle id does not exist: ' + battleId);
        }

        return battle;
    };

    const onBattleLoadMessage = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener<typeof BattleLoadMessage>(BattleLoadMessage, ({ payload, requestId }) => {
        const battle = getBattle(payload.battleId);

        const { mapInfos, staticPlayers, staticCharacters, staticSpells, initialSerializableState, cycleInfos } = battle;

        battle.playerJoin(currentPlayerId);

        return BattleLoadMessage.createResponse(requestId, {
            tiledMapInfos: mapInfos,
            staticPlayers,
            staticCharacters,
            staticSpells,
            initialSerializableState,
            cycleInfos,

            myPlayerId: currentPlayerId
        });
    });

    return {
        onSocketConnect: (socketCell, currentPlayerId) => {

            onBattleLoadMessage(socketCell, currentPlayerId);
        }
    };
});
