import { RoomTeamJoinMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { Service } from '../../service';

export class TeamRoomService extends Service {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string) => {
        this.addRoomTeamJoinMessageListener(socketCell, currentPlayerId);
    };

    private addRoomTeamJoinMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomTeamJoinMessage>(
        RoomTeamJoinMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { teamColorList, staticPlayerList } = room.getRoomStateData();

            const staticPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (staticPlayer.ready) {
                throw new SocketError('bad-server-state', 'Cannot change team if player ready: ' + currentPlayerId);
            }

            if (payload.teamColor) {
                if (!teamColorList.includes(payload.teamColor)) {
                    throw new SocketError('bad-request', 'Team color does not exist: ' + payload.teamColor);
                }
            }

            room.teamJoin(currentPlayerId, payload.teamColor);

            send(RoomTeamJoinMessage.createResponse(requestId, room.getRoomStateData()));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });
}
