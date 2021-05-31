import { RoomBattleStartMessage, RoomPlayerJoinMessage, RoomPlayerLeaveMessage, RoomPlayerReadyMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { Service } from '../../service';
import { Room } from '../room';

export class PlayerRoomService extends Service {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string): void => {
        this.addRoomPlayerJoinMessageListener(socketCell, currentPlayerId);
        this.addRoomPlayerReadyMessageListener(socketCell, currentPlayerId);
        this.addRoomPlayerLeaveMessageListener(socketCell, currentPlayerId);

        socketCell.addDisconnectListener(this.getPlayerLeaveFn(currentPlayerId));
    };

    private addRoomPlayerJoinMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomPlayerJoinMessage>(
        RoomPlayerJoinMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomById(payload.roomId);

            if (room.isInBattle()) {
                throw new SocketError(400, 'Cannot access room if it is in battle: ' + room.roomId);
            }

            if (this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ]) {
                throw new SocketError(400, 'Cannot access room if player in battle: ' + room.roomId);
            }

            if (this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ]) {
                throw new SocketError(400, 'Cannot access room if player in another room: ' + room.roomId);
            }

            room.playerJoin({
                playerId: currentPlayerId,
                playerName: 'name_' + currentPlayerId,
                teamColor: null,
                ready: false
            });

            send(RoomPlayerJoinMessage.createResponse(requestId, room.getRoomStateData()));

            this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ] = room;

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    private addRoomPlayerReadyMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomPlayerReadyMessage>(
        RoomPlayerReadyMessage, async ({ payload, requestId }, send) => {

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

            const everyPlayersReady = room.getRoomStateData().staticPlayerList.every(player => player.ready);

            if (everyPlayersReady) {
                await this.startBattle(room);
            }
        });

    private startBattle = async (room: Room) => {
        const waitState = await room.waitForBattle();

        if (waitState === 'canceled') {
            return;
        }

        const battle = await room.createBattle();
        this.sendToEveryPlayersExcept(
            RoomBattleStartMessage({ battleId: battle.battleId }),
            room.getRoomStateData().staticPlayerList
        );

        this.globalEntitiesNoServices.currentBattleMap.mapById[ battle.battleId ] = battle;
    };

    onBattleEnd = (roomId: string, battleId: string) => {
        const room = this.getRoomById(roomId);
        room.removeBattle();

        delete this.globalEntitiesNoServices.currentBattleMap.mapById[ battleId ];
    };

    private addRoomPlayerLeaveMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomPlayerLeaveMessage>(
        RoomPlayerLeaveMessage, this.getPlayerLeaveFn(currentPlayerId));

    private getPlayerLeaveFn = (currentPlayerId: string) => () => {

        const room = this.getRoomByPlayerId(currentPlayerId);

        room.playerLeave(currentPlayerId);

        this.sendRoomStateToEveryPlayersExcept(currentPlayerId);

        delete this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ];
    };
}
