import { createId } from '@timeflies/common';
import { RoomCharacterPlacementMessage, RoomCharacterRemoveMessage, RoomCharacterSelectMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { Service } from '../../service';

export class CharacterRoomService extends Service {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string) => {
        this.addRoomCharacterSelectMessageListener(socketCell, currentPlayerId);
        this.addRoomCharacterRemoveMessageListener(socketCell, currentPlayerId);
        this.addRoomCharacterPlacementMessageListener(socketCell, currentPlayerId);
    }

    private addRoomCharacterSelectMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomCharacterSelectMessage>(
        RoomCharacterSelectMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { mapInfos, staticPlayerList, staticCharacterList } = room.getRoomStateData();

            const currentPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (currentPlayer.ready) {
                throw new SocketError(400, 'Cannot select character if player ready: ' + currentPlayerId);
            }

            if (!currentPlayer.teamColor) {
                throw new SocketError(400, 'Cannot select character if player not in team: ' + currentPlayerId);
            }

            const nbrTeamCharacters = staticCharacterList
                .filter(({ playerId }) => staticPlayerList.some(staticPlayer =>
                    staticPlayer.teamColor === currentPlayer.teamColor
                    && playerId === staticPlayer.playerId
                ))
                .reduce((sum, c) => {
                    sum++;
                    return sum;
                }, 0);

            if (nbrTeamCharacters >= mapInfos!.nbrTeamCharacters) {
                throw new SocketError(400, 'Cannot select character if team is full');
            }

            room.characterSelect({
                characterId: createId(),
                playerId: currentPlayerId,
                characterRole: payload.characterRole,
                placement: null
            });

            send(RoomCharacterSelectMessage.createResponse(requestId, room.getRoomStateData()));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    private addRoomCharacterRemoveMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomCharacterRemoveMessage>(
        RoomCharacterRemoveMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { staticPlayerList, staticCharacterList } = room.getRoomStateData();

            const currentPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (currentPlayer.ready) {
                throw new SocketError(400, 'Cannot remove character if player ready: ' + currentPlayerId);
            }

            const character = staticCharacterList.find(character => character.characterId === payload.characterId);

            if (!character) {
                throw new SocketError(400, 'Wrong character id: ' + payload.characterId);
            }

            if (character.playerId !== currentPlayerId) {
                throw new SocketError(400, 'Cannot remove character of other players: ' + payload.characterId);
            }

            room.characterRemove(payload.characterId);

            send(RoomCharacterRemoveMessage.createResponse(requestId, room.getRoomStateData()));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    private addRoomCharacterPlacementMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomCharacterPlacementMessage>(
        RoomCharacterPlacementMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { staticPlayerList, staticCharacterList, mapPlacementTiles } = room.getRoomStateData();

            const currentPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (currentPlayer.ready) {
                throw new SocketError(400, 'Cannot place character if player ready: ' + currentPlayerId);
            }

            const character = staticCharacterList.find(character => character.characterId === payload.characterId);

            if (!character) {
                throw new SocketError(400, 'Wrong character id: ' + payload.characterId);
            }

            if (character.playerId !== currentPlayerId) {
                throw new SocketError(400, 'Cannot place character of other players: ' + payload.characterId);
            }

            if (payload.position) {
                if (staticCharacterList.some(({ placement }) => placement?.id === payload.position!.id)) {
                    throw new SocketError(400, 'Position occupied by other character: ' + payload.position.id);
                }

                const placementTiles = mapPlacementTiles[ currentPlayer.teamColor! ];
                if (!placementTiles.some(tile => tile.id === payload.position!.id)) {
                    throw new SocketError(400, 'Position not in placement tiles: ' + payload.position.id);
                }
            }

            room.characterPlacement(payload.characterId, payload.position);

            send(RoomCharacterPlacementMessage.createResponse(requestId, room.getRoomStateData()));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });
}
