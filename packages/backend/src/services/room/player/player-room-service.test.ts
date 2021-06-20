import { createPosition } from '@timeflies/common';
import { RoomBattleStartMessage, RoomPlayerJoinMessage, RoomPlayerLeaveMessage, RoomPlayerReadyMessage, RoomStateMessage } from '@timeflies/socket-messages';
import { SocketError } from '@timeflies/socket-server';
import { Battle } from '../../battle/battle';
import { createFakeBattle } from '../../battle/battle-service-test-utils';
import { createFakeRoom, getFakeRoomEntities } from '../room-service-test-utils';
import { PlayerRoomService } from './player-room-service';

describe('player room service', () => {

    const getEntities = () => getFakeRoomEntities(PlayerRoomService);

    describe('on player join message', () => {

        const getJoinEntities = () => {
            const entities = getEntities();

            entities.globalEntities.currentRoomMap.mapByPlayerId = {};
            entities.globalEntities.currentBattleMap.mapByPlayerId = {};

            return entities;
        };

        it('throw error if wrong room id', () => {
            const { socketCellP1, service } = getJoinEntities();

            service.onSocketConnect(socketCellP1, 'p10');

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            expect(() =>
                listener(RoomPlayerJoinMessage({
                    roomId: 'wrong-room-id'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it.skip('throw error if no map selected', () => {
            const { socketCellP1, connectSocket, room } = getJoinEntities();
            room.getRoomStateData = jest.fn(() => ({
                roomId: 'room',
                mapInfos: null,
                mapPlacementTiles: {},
                playerAdminId: '',
                teamColorList: [],
                staticPlayerList: [],
                staticCharacterList: []
            }));

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            expect(() =>
                listener(RoomPlayerJoinMessage({
                    roomId: 'room'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it.skip('throw error if map maximum players reached (nbr characters total)', () => {
            const { socketCellP1, connectSocket, room } = getJoinEntities();
            room.getRoomStateData = jest.fn(() => ({
                ...createFakeRoom().getRoomStateData(),
                mapInfos: {
                    mapId: '',
                    name: '',
                    nbrTeams: 3,
                    nbrTeamCharacters: 1,
                    schemaLink: '',
                    imagesLinks: {}
                }
            }));

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            expect(() =>
                listener(RoomPlayerJoinMessage({
                    roomId: 'room'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('answers with battleId if room in battle', async () => {
            const { socketCellP1, connectSocket, room } = getJoinEntities();

            connectSocket();

            room.getCurrentBattleId = jest.fn(() => 'battle');

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            await listener(RoomPlayerJoinMessage({
                roomId: 'room'
            }).get(), socketCellP1.send);

            expect(socketCellP1.send).toHaveBeenCalledWith(RoomPlayerJoinMessage.createResponse(expect.anything(), { battleId: 'battle' }))
        });

        it('throw error if player already in battle', () => {
            const { socketCellP1, connectSocket, globalEntities } = getJoinEntities();

            connectSocket();

            globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ] = createFakeBattle();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            expect(() =>
                listener(RoomPlayerJoinMessage({
                    roomId: 'room'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if player already in another room', () => {
            const { socketCellP1, connectSocket, globalEntities } = getJoinEntities();

            connectSocket();

            globalEntities.currentRoomMap.mapByPlayerId[ 'p1' ] = createFakeRoom();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            expect(() =>
                listener(RoomPlayerJoinMessage({
                    roomId: 'room'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, expectPlayersAnswers } = getJoinEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            await listener(RoomPlayerJoinMessage({
                roomId: 'room'
            }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomPlayerJoinMessage);
        });

        it('join player to room, before answering', async () => {
            const { socketCellP1, connectSocket, room } = getJoinEntities();

            const callOrder: string[] = [];

            socketCellP1.send = jest.fn(message => callOrder.push(message.action));
            room.playerJoin = jest.fn(() => callOrder.push('player-join'));

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            await listener(RoomPlayerJoinMessage({
                roomId: 'room'
            }).get(), socketCellP1.send);

            expect(callOrder).toEqual([ 'player-join', RoomPlayerJoinMessage.action ]);
        });

        it('add player to global room map', async () => {
            const { socketCellP1, connectSocket, globalEntities, room } = getJoinEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            await listener(RoomPlayerJoinMessage({
                roomId: 'room'
            }).get(), socketCellP1.send);

            expect(globalEntities.currentRoomMap.mapByPlayerId[ 'p1' ]).toBe(room);
        });
    });

    describe('on player ready message', () => {

        it('throw error if no characters selected', async () => {
            const { socketCellP1, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerReadyMessage);

            await expect(
                listener(RoomPlayerReadyMessage({
                    ready: true
                }).get(), socketCellP1.send)
            ).rejects.toBeInstanceOf(SocketError);
        });

        it('throw error if some player characters not placed', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerReadyMessage);

            room.getRoomStateData = jest.fn(() => ({
                ...createFakeRoom().getRoomStateData(),
                staticCharacterList: [ {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    playerId: 'p1',
                    placement: null
                } ]
            }));

            await expect(
                listener(RoomPlayerReadyMessage({
                    ready: true
                }).get(), socketCellP1.send)
            ).rejects.toBeInstanceOf(SocketError);
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, room, expectPlayersAnswers } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerReadyMessage);

            room.getRoomStateData = jest.fn(() => ({
                ...createFakeRoom().getRoomStateData(),
                staticCharacterList: [ {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    playerId: 'p1',
                    placement: createPosition(1, 1)
                } ]
            }));

            await listener(RoomPlayerReadyMessage({
                ready: true
            }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomPlayerReadyMessage);
        });

        it('join player to room, before answering', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            const callOrder: string[] = [];

            socketCellP1.send = jest.fn(message => callOrder.push(message.action));
            room.playerReady = jest.fn(() => callOrder.push('player-ready'));

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerReadyMessage);

            room.getRoomStateData = jest.fn(() => ({
                ...createFakeRoom().getRoomStateData(),
                staticCharacterList: [ {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    playerId: 'p1',
                    placement: createPosition(1, 1)
                } ]
            }));

            await listener(RoomPlayerReadyMessage({
                ready: true
            }).get(), socketCellP1.send);

            expect(callOrder).toEqual([ 'player-ready', RoomPlayerReadyMessage.action ]);
        });

        it('launch battle after some time when every players are ready', async () => {
            const { socketCellP1, connectSocket, room, expectEveryPlayersReceived, globalEntities } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerReadyMessage);

            room.getRoomStateData = jest.fn(() => ({
                ...createFakeRoom().getRoomStateData(),
                staticPlayerList: [
                    {
                        playerId: 'p1',
                        playerName: 'p1',
                        teamColor: null,
                        ready: true,
                        type: 'player'
                    },
                    {
                        playerId: 'p2',
                        playerName: 'p2',
                        teamColor: null,
                        ready: true,
                        type: 'player'
                    },
                    {
                        playerId: 'p3',
                        playerName: 'p3',
                        teamColor: null,
                        ready: true,
                        type: 'player'
                    },
                    {
                        playerId: 'p4',
                        playerName: 'p4',
                        teamColor: null,
                        ready: false,
                        type: 'spectator'
                    }
                ],
                staticCharacterList: [ {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    playerId: 'p1',
                    placement: createPosition(1, 1)
                } ]
            }));

            room.waitForBattle = jest.fn(async () => 'completed');
            room.createBattle = jest.fn(async () => createFakeBattle());

            await listener(RoomPlayerReadyMessage({
                ready: true
            }).get(), socketCellP1.send);

            expectEveryPlayersReceived(RoomBattleStartMessage({ battleId: 'battle' }));

            expect(globalEntities.currentBattleMap.mapById[ 'battle' ]).toMatchObject<Partial<Battle>>({ battleId: 'battle' });
        });
    });

    describe('on player leave message', () => {

        it('leave player from room', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            room.playerLeave = jest.fn(room.playerLeave);

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(room.playerLeave).toHaveBeenCalledWith('p1');
        });

        it('send update to other players', async () => {
            const { socketCellP1, socketCellP2, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(socketCellP2.send).toHaveBeenCalledWith(RoomStateMessage(room.getRoomStateData()));
        });

        it('remove player from global room map', async () => {
            const { socketCellP1, globalEntities, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(globalEntities.currentRoomMap.mapByPlayerId[ 'p1' ]).toBeUndefined();
        });
    });

    describe('on player disconnect', () => {

        it('apply player leave effects', async () => {
            const { socketCellP1, socketCellP2, connectSocket, room, globalEntities } = getEntities();

            room.playerLeave = jest.fn(room.playerLeave);

            connectSocket();

            const disconnectListener = socketCellP1.getDisconnectListener()!;
            disconnectListener();

            expect(room.playerLeave).toHaveBeenCalledWith('p1');
            expect(socketCellP2.send).toHaveBeenCalledWith(RoomStateMessage(room.getRoomStateData()));
            expect(globalEntities.currentRoomMap.mapByPlayerId[ 'p1' ]).toBeUndefined();
        });
    });
});
