import { PlayerId } from '@timeflies/common';
import { ChatNotifyMessage, ChatSendMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { Service } from '../service';

export class ChatService extends Service {
    afterSocketConnect = (socketCell: SocketCell, currentPlayerId: PlayerId) => {
        this.addChatMessageListener(socketCell, currentPlayerId);
    };

    private addChatMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener<typeof ChatSendMessage>(ChatSendMessage, async ({ payload, requestId }, send) => {

        const battle = this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ];
        const room = this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ];

        if (!room && !battle) {
            throw new SocketError('bad-server-state', 'Player trying to send chat message outside of room or battle: ' + currentPlayerId);
        }

        if (payload.time > Date.now()) {
            throw new SocketError('bad-request', 'Chat send message received from future: ' + payload.time);
        }

        const { playerName } = this.globalEntitiesNoServices.playerCredentialsMap.mapById[ currentPlayerId ];

        const message = ChatNotifyMessage({
            message: payload.message,
            playerId: currentPlayerId,
            playerName,
            time: payload.time
        });

        if (battle) {
            this.sendToEveryPlayersExcept(
                message,
                battle.staticPlayers,
                currentPlayerId
            );
        } else if (room) {
            this.sendToEveryPlayersExcept(
                message,
                room.staticPlayerList,
                currentPlayerId
            );
        }

        send(ChatSendMessage.createResponse(requestId, { success: true }));
    });
}
