import { RoomAiAddMessage, RoomAiRemoveMessage, RoomStaticPlayer } from '@timeflies/socket-messages';
import { SocketError } from '@timeflies/socket-server';
import { getFakeRoomEntities } from '../room-service-test-utils';
import { AiRoomService } from './ai-room-service';

describe('AI room service', () => {

    const getEntities = () => {
        const entities = getFakeRoomEntities(AiRoomService);

        return entities;
    };

    describe('on AI add message', () => {

        it('throw error if player not admin', async () => {
            const { socketCellP1, room, connectSocket } = getEntities();

            room.playerAdminId = 'foo';

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiAddMessage);

            expect(() =>
                listener(RoomAiAddMessage({ teamColor: '#FFF' }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if player ready', async () => {
            const { socketCellP1, room, connectSocket } = getEntities();

            room.staticPlayerList = [
                {
                    playerId: 'p1',
                    playerName: '',
                    ready: true,
                    teamColor: '#FFF',
                    type: 'player'
                }
            ];

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiAddMessage);

            expect(() =>
                listener(RoomAiAddMessage({ teamColor: '#FFF' }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if wrong team color', async () => {
            const { socketCellP1, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiAddMessage);

            expect(() =>
                listener(RoomAiAddMessage({ teamColor: 'wrong-color' }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('add AI player to team', async () => {
            const { socketCellP1, room, connectSocket } = getEntities();

            room.staticPlayerList = [
                {
                    playerId: 'p1',
                    playerName: '',
                    ready: false,
                    teamColor: '#FFF',
                    type: 'player'
                }
            ];

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiAddMessage);

            await listener(RoomAiAddMessage({ teamColor: '#FFF' }).get(), socketCellP1.send);

            expect(room.staticPlayerList).toEqual<RoomStaticPlayer[]>([
                {
                    playerId: 'p1',
                    playerName: '',
                    ready: false,
                    teamColor: '#FFF',
                    type: 'player'
                },
                {
                    playerId: expect.any(String),
                    playerName: expect.any(String),
                    ready: false,
                    teamColor: '#FFF',
                    type: 'ai'
                },
            ]);
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, expectPlayersAnswers } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiAddMessage);

            await listener(RoomAiAddMessage({ teamColor: '#FFF' }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomAiAddMessage);
        });
    });

    describe('on AI remove message', () => {

        const getAiEntities = () => {
            const { room, ...rest } = getEntities();

            room.staticPlayerList.push({
                playerId: 'ai1',
                playerName: '',
                ready: false,
                teamColor: '#FFF',
                type: 'ai'
            });

            room.staticCharacterList = [
                {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    placement: null,
                    playerId: 'ai1'
                }
            ];

            return { room, ...rest };
        };

        it('throw error if player not admin', async () => {
            const { socketCellP1, room, connectSocket } = getAiEntities();

            room.playerAdminId = 'foo';

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiRemoveMessage);

            expect(() =>
                listener(RoomAiRemoveMessage({ playerId: 'ai1' }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if player ready', async () => {
            const { socketCellP1, room, connectSocket } = getAiEntities();

            room.staticPlayerList[ 0 ].ready = true;

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiRemoveMessage);

            expect(() =>
                listener(RoomAiRemoveMessage({ playerId: 'ai1' }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if wrong AI player id', async () => {
            const { socketCellP1, connectSocket } = getAiEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiRemoveMessage);

            expect(() =>
                listener(RoomAiRemoveMessage({ playerId: 'wrong-id' }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('remove AI player', async () => {
            const { socketCellP1, room, connectSocket } = getAiEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiRemoveMessage);

            await listener(RoomAiRemoveMessage({ playerId: 'ai1' }).get(), socketCellP1.send);

            expect(room.staticPlayerList).toEqual<RoomStaticPlayer[]>([
                {
                    playerId: 'p1',
                    playerName: 'p1',
                    teamColor: null,
                    ready: false,
                    type: 'player'
                },
                {
                    playerId: 'p2',
                    playerName: 'p2',
                    teamColor: null,
                    ready: false,
                    type: 'player'
                },
                {
                    playerId: 'p3',
                    playerName: 'p3',
                    teamColor: null,
                    ready: false,
                    type: 'player'
                }
            ]);
        });

        it('remove all AI player characters', async () => {
            const { socketCellP1, room, connectSocket } = getAiEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiRemoveMessage);

            await listener(RoomAiRemoveMessage({ playerId: 'ai1' }).get(), socketCellP1.send);

            expect(room.staticCharacterList).toEqual([]);
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, expectPlayersAnswers } = getAiEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomAiRemoveMessage);

            await listener(RoomAiRemoveMessage({ playerId: 'ai1' }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomAiRemoveMessage);
        });
    });
});
