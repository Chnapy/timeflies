import { createId } from '@timeflies/common';
import { RoomCharacterPlacementMessage, RoomCharacterRemoveMessage, RoomCharacterSelectMessage } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { RoomAbstractService } from '../room-abstract-service';

export class CharacterRoomService extends RoomAbstractService {
    protected afterSocketConnect = (socketCell: SocketCell, currentPlayerId: string) => {
        this.addRoomCharacterSelectMessageListener(socketCell, currentPlayerId);
        this.addRoomCharacterRemoveMessageListener(socketCell, currentPlayerId);
        this.addRoomCharacterPlacementMessageListener(socketCell, currentPlayerId);
    }

    private addRoomCharacterSelectMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomCharacterSelectMessage>(
        RoomCharacterSelectMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { mapInfos, staticPlayerList, staticCharacterList } = room;

            const currentPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (currentPlayer.ready) {
                throw new SocketError('bad-server-state', 'Cannot select character if player ready: ' + currentPlayerId);
            }

            if (!currentPlayer.teamColor) {
                throw new SocketError('bad-server-state', 'Cannot select character if player not in team: ' + currentPlayerId);
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
                throw new SocketError('bad-server-state', 'Cannot select character if team is full');
            }

            staticCharacterList.push({
                characterId: createId(),
                playerId: currentPlayerId,
                characterRole: payload.characterRole,
                placement: null
            });

            send(RoomCharacterSelectMessage.createResponse(requestId, this.getRoomStateData(room)));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    private addRoomCharacterRemoveMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomCharacterRemoveMessage>(
        RoomCharacterRemoveMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { staticPlayerList, staticCharacterList } = room;

            const currentPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (currentPlayer.ready) {
                throw new SocketError('bad-server-state', 'Cannot remove character if player ready: ' + currentPlayerId);
            }

            const { characterId } = payload;

            const character = staticCharacterList.find(character => character.characterId === characterId);

            if (!character) {
                throw new SocketError('bad-request', 'Wrong character id: ' + characterId);
            }

            if (character.playerId !== currentPlayerId) {
                throw new SocketError('bad-request', 'Cannot remove character of other players: ' + characterId);
            }

            staticCharacterList.splice(
                staticCharacterList.findIndex(c => c.characterId === characterId),
                1
            );

            send(RoomCharacterRemoveMessage.createResponse(requestId, this.getRoomStateData(room)));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });

    private addRoomCharacterPlacementMessageListener = (socketCell: SocketCell, currentPlayerId: string) => socketCell.addMessageListener<typeof RoomCharacterPlacementMessage>(
        RoomCharacterPlacementMessage, ({ payload, requestId }, send) => {

            const room = this.getRoomByPlayerId(currentPlayerId);

            const { staticPlayerList, staticCharacterList, mapPlacementTiles } = room;

            const currentPlayer = staticPlayerList.find(p => p.playerId === currentPlayerId)!;
            if (currentPlayer.ready) {
                throw new SocketError('bad-server-state', 'Cannot place character if player ready: ' + currentPlayerId);
            }

            const { characterId, position } = payload;

            const character = staticCharacterList.find(character => character.characterId === characterId);

            if (!character) {
                throw new SocketError('bad-request', 'Wrong character id: ' + characterId);
            }

            if (character.playerId !== currentPlayerId) {
                throw new SocketError('bad-request', 'Cannot place character of other players: ' + characterId);
            }

            if (position) {
                if (staticCharacterList.some(({ placement }) => placement?.id === position.id)) {
                    throw new SocketError('bad-request', 'Position occupied by other character: ' + position.id);
                }

                const placementTiles = mapPlacementTiles[ currentPlayer.teamColor! ];
                if (!placementTiles.some(tile => tile.id === position.id)) {
                    throw new SocketError('bad-request', 'Position not in placement tiles: ' + position.id);
                }
            }

            character.placement = position;

            send(RoomCharacterPlacementMessage.createResponse(requestId, this.getRoomStateData(room)));

            this.sendRoomStateToEveryPlayersExcept(currentPlayerId);
        });
}
