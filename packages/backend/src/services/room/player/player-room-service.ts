import { PlayerId, waitCanceleable } from '@timeflies/common';
import { BattleLeaveMessage, RoomBattleStartMessage, RoomEntityListGetMessageData, RoomPlayerJoinMessage, RoomPlayerLeaveMessage, RoomPlayerReadyMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { BattlePayload, createBattle } from '../../battle/battle';
import { Room } from '../room';
import { RoomAbstractService } from '../room-abstract-service';

export class PlayerRoomService extends RoomAbstractService {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string): void => {
        this.addRoomPlayerJoinMessageListener(socketCell, currentPlayerId);
        this.addRoomPlayerReadyMessageListener(socketCell, currentPlayerId);
        this.addRoomPlayerLeaveMessageListener(socketCell, currentPlayerId);
        this.addBattleLeaveMessageListener(socketCell, currentPlayerId);

        socketCell.addDisconnectListener(this.getPlayerLeaveFn(currentPlayerId, false));
    };

    private addRoomPlayerJoinMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomPlayerJoinMessage>(
        RoomPlayerJoinMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomById(payload.roomId);

            if (this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ currentPlayerId ]) {
                throw new SocketError('bad-server-state', 'Cannot access room if player in battle: ' + room.roomId);
            }

            if (this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ]
                && this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ] !== room) {
                throw new SocketError('bad-server-state', 'Cannot access room if player in another room: ' + room.roomId);
            }

            const battleId = room.battle?.battleId;
            if (battleId) {
                return send(RoomPlayerJoinMessage.createResponse(requestId, { battleId }));
            }

            this.playerJoinToRoom(room, currentPlayerId);

            send(RoomPlayerJoinMessage.createResponse(requestId, this.getRoomStateData(room)));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    playerJoinToRoom = (room: Room, currentPlayerId: PlayerId) => {

        if (this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ]) {
            return;
        }

        const { playerName } = this.globalEntitiesNoServices.playerCredentialsMap.mapById[ currentPlayerId ];

        room.staticPlayerList.push({
            playerId: currentPlayerId,
            playerName,
            teamColor: null,
            ready: false,
            type: 'spectator'
        });

        if (!room.playerAdminId) {
            room.playerAdminId = currentPlayerId;
        }

        room.cancelBattleLaunch();

        this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ] = room;
    };

    private addRoomPlayerReadyMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomPlayerReadyMessage>(
        RoomPlayerReadyMessage, async ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { staticPlayerList, staticCharacterList } = room;

            const playerCharacterList = staticCharacterList
                .filter(({ playerId }) => playerId === currentPlayerId);

            if (!playerCharacterList.length) {
                throw new SocketError('bad-server-state', 'Player cannot be ready with no characters selected: ' + currentPlayerId);
            }

            if (playerCharacterList.some(character => character.placement === null)) {
                throw new SocketError('bad-server-state', 'Player cannot be ready with characters not placed: ' + currentPlayerId);
            }

            const player = staticPlayerList.find(p => p.playerId === currentPlayerId);
            player!.ready = payload.ready;

            if (!payload.ready) {
                room.cancelBattleLaunch();
            }

            send(RoomPlayerReadyMessage.createResponse(requestId, this.getRoomStateData(room)));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);

            const everyPlayersReady = staticPlayerList
                .filter(player => player.type === 'player')
                .every(player => player.ready);

            if (everyPlayersReady) {
                await this.startBattle(room);
            }
        });

    private startBattle = async (room: Room) => {
        const { promise, cancel } = waitCanceleable(5000);

        room.cancelBattleLaunch = cancel;

        const waitState = (await promise).state;

        if (waitState === 'canceled') {
            return;
        }

        const payload = this.getBattlePayload(
            room,
            this.services.entityListGetRoomService.getEntityLists()
        );

        const battle = createBattle(
            {
                ...this.globalEntitiesNoServices,
                services: this.services
            },
            payload,
            () => this.services.playerRoomService.onBattleEnd(room.roomId, battle.battleId)
        );
        room.battle = battle;

        this.sendToEveryPlayersExcept(
            RoomBattleStartMessage({ battleId: battle.battleId }),
            room.staticPlayerList
        );

        this.globalEntitiesNoServices.currentBattleMap.mapById[ battle.battleId ] = battle;
    };

    private getBattlePayload = (
        { roomId, mapInfos, staticPlayerList, staticCharacterList, tiledMap }: Room,
        entityListData: RoomEntityListGetMessageData
    ): BattlePayload => ({
        roomId,
        staticPlayerList,
        staticCharacterList,
        entityListData,
        mapInfos: mapInfos!,
        tiledMap: tiledMap!
    });

    onBattleEnd = (roomId: string, battleId: string) => {
        const room = this.getRoomById(roomId);

        room.battle = null;
        room.staticPlayerList.forEach(player => {
            player.ready = false;
        });

        delete this.globalEntitiesNoServices.currentBattleMap.mapById[ battleId ];
    };

    private addRoomPlayerLeaveMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener(
        RoomPlayerLeaveMessage, this.getPlayerLeaveFn(currentPlayerId, true));

    private addBattleLeaveMessageListener = (socketCell: SocketCell, currentPlayerId: PlayerId) => socketCell.addMessageListener(
        BattleLeaveMessage, this.getPlayerLeaveFn(currentPlayerId, false));

    private getPlayerLeaveFn = (currentPlayerId: string, ignoreIfBattle: boolean) => () => {

        const room = this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ];
        if (!room) {
            return;
        }

        if (ignoreIfBattle && room.battle) {
            return;
        }

        this.playerLeave(room, currentPlayerId);

        this.sendRoomStateToEveryPlayersExcept(currentPlayerId);

        delete this.globalEntitiesNoServices.currentRoomMap.mapByPlayerId[ currentPlayerId ];

        if (room.staticPlayerList.length === 0) {
            delete this.globalEntitiesNoServices.currentRoomMap.mapById[ room.roomId ];
        }
    };

    private playerLeave = (room: Room, playerId: PlayerId) => {
        const { staticPlayerList, cancelBattleLaunch } = room;
        const playerIndex = staticPlayerList.findIndex(c => c.playerId === playerId);
        const player = staticPlayerList[ playerIndex ];
        staticPlayerList.splice(
            playerIndex,
            1
        );
        room.staticCharacterList = room.staticCharacterList.filter(character => character.playerId !== playerId);

        if (player.type === 'player') {
            if (playerId === room.playerAdminId) {
                room.playerAdminId = staticPlayerList.find(player => player.type === 'player')?.playerId ?? '';
            }

            cancelBattleLaunch();
        }
    };
}
