import { PlayerId, StaticPlayer } from '@timeflies/common';
import { RoomPlayerJoinMessage, RoomPlayerLeaveMessage, RoomPlayerReadyMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { Service } from '../../service';

export class PlayerRoomService extends Service {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string): void => {
        this.addRoomPlayerJoinMessageListener(socketCell, currentPlayerId);
        this.addRoomPlayerReadyMessageListener(socketCell, currentPlayerId);
        this.addRoomPlayerLeaveMessageListener(socketCell, currentPlayerId);
    };

    private addRoomPlayerJoinMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomPlayerJoinMessage>(
        RoomPlayerJoinMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomById(payload.roomId);

            // const { mapInfos, staticPlayerList } = room.getRoomStateData();

            // if (!mapInfos) {
            //     throw new SocketError(400, 'Player cannot join room if there is no map selected: ' + currentPlayerId);
            // }

            // if(staticPlayerList.length >= mapInfos.nbrTeams * mapInfos.nbrTeamCharacters) {
            //     throw new SocketError(400, 'Player cannot join room if maximum nbr players reached: ' + currentPlayerId);
            // }

            room.playerJoin({
                ...getPlayerBasicInfos(currentPlayerId),
                teamColor: null,
                ready: false
            });

            send(RoomPlayerJoinMessage.createResponse(requestId, room.getRoomStateData()));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    private addRoomPlayerReadyMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomPlayerReadyMessage>(
        RoomPlayerReadyMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { staticCharacterList } = room.getRoomStateData();

            const playerCharacterList = staticCharacterList
                .filter(({ playerId }) => playerId === currentPlayerId);

            if (!playerCharacterList.length) {
                throw new SocketError(400, 'Player cannot be ready with no characters selected: ' + currentPlayerId);
            }

            if (playerCharacterList.some(character => character.placement === null)) {
                throw new SocketError(400, 'Player cannot be ready with characters not placed: ' + currentPlayerId);
            }

            room.playerReady(currentPlayerId, payload.ready);

            send(RoomPlayerReadyMessage.createResponse(requestId, room.getRoomStateData()));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    private addRoomPlayerLeaveMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomPlayerLeaveMessage>(
        RoomPlayerLeaveMessage, ({ }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            room.playerLeave(currentPlayerId);

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });
}

// MOCKs

const getPlayerBasicInfos = (playerId: PlayerId): Omit<StaticPlayer, 'teamColor'> => ({
    p1: {
        playerId: 'p1',
        playerName: 'chnapy'
    },
    p2: {
        playerId: 'p2',
        playerName: 'yoshi2oeuf'
    }
} as Record<PlayerId, Omit<StaticPlayer, 'teamColor'>>)[ playerId ];
