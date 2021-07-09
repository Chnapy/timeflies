import { createPosition } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { RoomBattleStartMessage, RoomPlayerJoinMessage, RoomPlayerLeaveMessage, RoomPlayerReadyMessage, RoomStateMessage, RoomStaticCharacter, RoomStaticPlayer } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { GlobalEntitiesNoServices } from '../../../main/global-entities';
import { Battle } from '../../battle/battle';
import { createFakeBattle } from '../../battle/battle-service-test-utils';
import { Room } from '../room';
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

        it('answers with battleId if room in battle', async () => {
            const { socketCellP1, connectSocket, room } = getJoinEntities();

            connectSocket();

            room.battle = createFakeBattle();

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

        it('join player to room', async () => {
            const { socketCellP1, connectSocket, room } = getJoinEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            room.staticPlayerList = [];

            await listener(RoomPlayerJoinMessage({
                roomId: 'room'
            }).get(), socketCellP1.send);

            expect(room.staticPlayerList).toEqual<RoomStaticPlayer[]>([ {
                playerId: 'p1',
                playerName: 'p-1',
                ready: false,
                teamColor: null,
                type: 'spectator'
            } ]);
        });

        it('set player admin if first joined', async () => {
            const { socketCellP1, connectSocket, room } = getJoinEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            room.staticPlayerList = [];

            await listener(RoomPlayerJoinMessage({
                roomId: 'room'
            }).get(), socketCellP1.send);

            expect(room.playerAdminId).toEqual('p1');
        });

        it('cancel battle launch if any', async () => {
            const { socketCellP1, connectSocket, room } = getJoinEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            await listener(RoomPlayerJoinMessage({
                roomId: 'room'
            }).get(), socketCellP1.send);

            expect(room.cancelBattleLaunch).toHaveBeenCalled();
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

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, expectPlayersAnswers } = getJoinEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerJoinMessage);

            await listener(RoomPlayerJoinMessage({
                roomId: 'room'
            }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomPlayerJoinMessage);
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

            room.staticCharacterList = [ {
                characterId: 'c1',
                characterRole: 'tacka',
                playerId: 'p1',
                placement: null
            } ];

            await expect(
                listener(RoomPlayerReadyMessage({
                    ready: true
                }).get(), socketCellP1.send)
            ).rejects.toBeInstanceOf(SocketError);
        });

        it('set player ready', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerReadyMessage);

            room.staticCharacterList = [ {
                characterId: 'c1',
                characterRole: 'tacka',
                playerId: 'p1',
                placement: createPosition(1, 1)
            } ];

            await listener(RoomPlayerReadyMessage({
                ready: true
            }).get(), socketCellP1.send);

            expect(room.staticPlayerList).toContainEqual(expect.objectContaining<Partial<RoomStaticPlayer>>({
                playerId: 'p1',
                ready: true
            }));
        });

        it('if undo ready cancel battle launch if any', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerReadyMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                ready: true,
                teamColor: '#FFF',
                type: 'player'
            } ];
            room.staticCharacterList = [ {
                characterId: 'c1',
                characterRole: 'tacka',
                playerId: 'p1',
                placement: createPosition(1, 1)
            } ];

            await listener(RoomPlayerReadyMessage({
                ready: false
            }).get(), socketCellP1.send);

            expect(room.cancelBattleLaunch).toHaveBeenCalled();
        });

        it('launch battle after some time when every players are ready', async () => {
            const { socketCellP1, connectSocket, room, expectEveryPlayersReceived, globalEntities } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerReadyMessage);

            room.staticPlayerList = [
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
            ];
            room.staticCharacterList = [ {
                characterId: 'c1',
                characterRole: 'tacka',
                playerId: 'p1',
                placement: createPosition(1, 1)
            } ];

            await timerTester.endTimer(
                listener(RoomPlayerReadyMessage({
                    ready: true
                }).get(), socketCellP1.send)
            );

            expectEveryPlayersReceived(RoomBattleStartMessage({ battleId: expect.any(String) }));

            expect(room.battle).toMatchObject<Partial<Battle>>({ battleId: expect.any(String) });
            expect(globalEntities.currentBattleMap.mapById[ room.battle!.battleId ]).toBe(room.battle);
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, room, expectPlayersAnswers } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerReadyMessage);

            room.staticCharacterList = [ {
                characterId: 'c1',
                characterRole: 'tacka',
                playerId: 'p1',
                placement: createPosition(1, 1)
            } ];

            await listener(RoomPlayerReadyMessage({
                ready: true
            }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomPlayerReadyMessage);
        });
    });

    describe('on player leave message', () => {

        it('does nothing if battle running', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            room.battle = createFakeBattle();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(room.staticPlayerList).toContainEqual(expect.objectContaining<Partial<RoomStaticPlayer>>({
                playerId: 'p1'
            }));
        });

        it('leave player from room', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(room.staticPlayerList).not.toContainEqual(expect.objectContaining<Partial<RoomStaticPlayer>>({
                playerId: 'p1'
            }));
        });

        it('remove player characters from room', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            room.staticCharacterList = [
                {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    placement: null,
                    playerId: 'p1'
                },
                {
                    characterId: 'c2',
                    characterRole: 'tacka',
                    placement: null,
                    playerId: 'p2'
                }
            ];

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(room.staticCharacterList).toEqual<RoomStaticCharacter[]>([
                {
                    characterId: 'c2',
                    characterRole: 'tacka',
                    placement: null,
                    playerId: 'p2'
                }
            ]);
        });

        it('change player admin if leaved', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            room.staticPlayerList = [
                {
                    playerId: 'p1',
                    playerName: '',
                    ready: false,
                    teamColor: null,
                    type: 'player'
                },
                {
                    playerId: 'p2',
                    playerName: '',
                    ready: false,
                    teamColor: null,
                    type: 'player'
                }
            ];
            room.playerAdminId = 'p1';

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(room.playerAdminId).toEqual('p2');
        });

        it('cancel battle launch if any', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(room.cancelBattleLaunch).toHaveBeenCalled();
        });

        it('remove player from global room map', async () => {
            const { socketCellP1, globalEntities, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(globalEntities.currentRoomMap.mapByPlayerId[ 'p1' ]).toBeUndefined();
        });

        it('send update to other players', async () => {
            const { socketCellP1, socketCellP2, getRoomStateData, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomPlayerLeaveMessage);

            await listener(RoomPlayerLeaveMessage({}), socketCellP1.send);

            expect(socketCellP2.send).toHaveBeenCalledWith(RoomStateMessage(getRoomStateData(room)));
        });
    });

    describe('on player disconnect', () => {

        const initRoom = (room: Room) => {
            room.staticPlayerList = [
                {
                    playerId: 'p1',
                    playerName: '',
                    ready: false,
                    teamColor: null,
                    type: 'player'
                },
                {
                    playerId: 'p2',
                    playerName: '',
                    ready: false,
                    teamColor: null,
                    type: 'player'
                }
            ];
            room.playerAdminId = 'p1';
            room.staticCharacterList = [
                {
                    characterId: 'c1',
                    characterRole: 'tacka',
                    placement: null,
                    playerId: 'p1'
                },
                {
                    characterId: 'c2',
                    characterRole: 'tacka',
                    placement: null,
                    playerId: 'p2'
                }
            ];
        };

        const expectLeaveRoomEffects = (room: Room, socketCellP2: SocketCell, globalEntities: GlobalEntitiesNoServices) => {
            const { getRoomStateData } = getEntities();

            expect(room.staticPlayerList).not.toContainEqual(expect.objectContaining<Partial<RoomStaticPlayer>>({
                playerId: 'p1'
            }));
            expect(room.staticCharacterList).toEqual<RoomStaticCharacter[]>([
                {
                    characterId: 'c2',
                    characterRole: 'tacka',
                    placement: null,
                    playerId: 'p2'
                }
            ]);
            expect(room.playerAdminId).toEqual('p2');
            expect(room.cancelBattleLaunch).toHaveBeenCalled();

            expect(socketCellP2.send).toHaveBeenCalledWith(RoomStateMessage(getRoomStateData(room)));
            expect(globalEntities.currentRoomMap.mapByPlayerId[ 'p1' ]).toBeUndefined();
        };

        it('apply player leave effects', async () => {
            const { socketCellP1, socketCellP2, connectSocket, room, globalEntities } = getEntities();

            initRoom(room);

            connectSocket();

            const disconnectListener = socketCellP1.getDisconnectListener()!;
            disconnectListener();

            expectLeaveRoomEffects(room, socketCellP2, globalEntities);
        });

        it('apply player leave effects even if battle running', async () => {
            const { socketCellP1, socketCellP2, connectSocket, room, globalEntities } = getEntities();

            initRoom(room);
            room.battle = createFakeBattle();

            connectSocket();

            const disconnectListener = socketCellP1.getDisconnectListener()!;
            disconnectListener();

            expectLeaveRoomEffects(room, socketCellP2, globalEntities);
        });
    });

    describe('battle end', () => {
        it('remove battle from room and global entities', async () => {
            const { connectSocket, room, globalEntities, service } = getEntities();

            globalEntities.currentBattleMap.mapById[ 'battle' ] = createFakeBattle();
            room.battle = createFakeBattle();
            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                ready: true,
                teamColor: '#FFF',
                type: 'player'
            } ];

            service.onBattleEnd('room', 'battle');

            connectSocket();

            expect(room.battle).toEqual(null);
            expect(room.staticPlayerList).toEqual<RoomStaticPlayer[]>([ {
                playerId: 'p1',
                playerName: '',
                ready: false,
                teamColor: '#FFF',
                type: 'player'
            } ]);
            expect(globalEntities.currentBattleMap.mapById[ 'battle' ]).toBeUndefined();
        });
    });
});
