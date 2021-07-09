import { RoomTeamJoinMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { Room } from '../room';
import { RoomAbstractService } from '../room-abstract-service';

const allTeamColorList = [ '#3BA92A', '#FFD74A', '#A93B2A', '#3BA9A9' ];

export class TeamRoomService extends RoomAbstractService {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string) => {
        this.addRoomTeamJoinMessageListener(socketCell, currentPlayerId);
    };

    private addRoomTeamJoinMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomTeamJoinMessage>(
        RoomTeamJoinMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { teamColorList, staticPlayerList } = room;

            const staticPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (staticPlayer.ready) {
                throw new SocketError('bad-server-state', 'Cannot change team if player ready: ' + currentPlayerId);
            }

            const { teamColor } = payload;

            if (teamColor) {
                if (!teamColorList.includes(teamColor)) {
                    throw new SocketError('bad-request', 'Team color does not exist: ' + teamColor);
                }
            }

            const player = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            player.teamColor = teamColor;

            if (teamColor) {
                player.type = 'player';
            } else {
                player.type = 'spectator';
                room.staticCharacterList = room.staticCharacterList.filter(character => character.playerId !== currentPlayerId);
            }

            send(RoomTeamJoinMessage.createResponse(requestId, this.getRoomStateData(room)));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    getRoomTeamColorList = (room: Room) => {
        const { mapInfos } = room;

        return mapInfos
            ? allTeamColorList.slice(0, mapInfos.nbrTeams)
            : [];
    };
}
