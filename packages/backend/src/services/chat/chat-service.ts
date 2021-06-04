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
            throw new SocketError(403, 'Player trying to send chat message outside of room or battle: ' + currentPlayerId);
        }

        if (payload.time > Date.now()) {
            throw new SocketError(400, 'Chat send message received from future: ' + payload.time);
        }

        if (battle) {
            this.sendToEveryPlayersExcept(
                ChatNotifyMessage({
                    message: payload.message,
                    playerId: currentPlayerId,
                    time: payload.time
                }),
                battle.staticPlayers,
                currentPlayerId
            );
        } else if (room) {
            this.sendToEveryPlayersExcept(
                ChatNotifyMessage({
                    message: payload.message,
                    playerId: currentPlayerId,
                    time: payload.time
                }),
                room.getRoomStateData().staticPlayerList,
                currentPlayerId
            );
        }

        send(ChatSendMessage.createResponse(requestId, { success: true }));
    });
}
