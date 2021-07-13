import { createId } from '@timeflies/common';
import { RoomAiAddMessage, RoomAiRemoveMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { RoomAbstractService } from '../room-abstract-service';

export class AiRoomService extends RoomAbstractService {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string): void => {
        this.addRoomAiAddMessageListener(socketCell, currentPlayerId);
        this.addRoomAiRemoveMessageListener(socketCell, currentPlayerId);
    };

    private addRoomAiAddMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomAiAddMessage>(
        RoomAiAddMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            if (room.playerAdminId !== currentPlayerId) {
                throw new SocketError('bad-server-state', 'Cannot add AI if player not admin: ' + currentPlayerId);
            }

            const player = room.staticPlayerList.find(p => p.playerId === currentPlayerId)!;

            if (player.ready) {
                throw new SocketError('bad-server-state', 'Cannot add AI if player ready: ' + currentPlayerId);
            }

            const { teamColor } = payload;

            if (!room.teamColorList.includes(teamColor)) {
                throw new SocketError('bad-request', 'Wrong team color: ' + teamColor);
            }

            room.staticPlayerList.push({
                playerId: createId(),
                playerName: `AI [${createId('short')}]`,
                teamColor,
                ready: false,
                type: 'ai'
            });

            send(RoomAiAddMessage.createResponse(requestId, this.getRoomStateData(room)));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    private addRoomAiRemoveMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomAiRemoveMessage>(
        RoomAiRemoveMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            if (room.playerAdminId !== currentPlayerId) {
                throw new SocketError('bad-server-state', 'Cannot remove AI if player not admin: ' + currentPlayerId);
            }

            const player = room.staticPlayerList.find(p => p.playerId === currentPlayerId)!;

            if (player.ready) {
                throw new SocketError('bad-server-state', 'Cannot remove AI if player ready: ' + currentPlayerId);
            }

            const { playerId } = payload;

            const aiPlayer = room.staticPlayerList.find(p => p.playerId === playerId);
            if (aiPlayer?.type !== 'ai') {
                throw new SocketError('bad-request', 'Wrong AI player id: ' + playerId);
            }

            room.staticPlayerList.splice(
                room.staticPlayerList.findIndex(c => c.playerId === playerId),
                1
            );

            room.staticCharacterList = room.staticCharacterList.filter(c => c.playerId !== playerId);

            send(RoomAiRemoveMessage.createResponse(requestId, this.getRoomStateData(room)));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });
}
