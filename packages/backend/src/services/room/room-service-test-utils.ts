import { Message, MessageWithResponseCreator, RoomStateMessage } from '@timeflies/socket-messages';
import { createFakeBattle } from '../battle/battle-service-test-utils';
import { Service } from '../service';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../service-test-utils';
import { Room } from './room';

export const createFakeRoom = (): Room => ({
    roomId: 'room',
    getRoomStateData: jest.fn(() => ({
        roomId: 'room',
        mapInfos: {
            mapId: 'm1',
            name: 'm1',
            nbrTeams: 3,
            nbrTeamCharacters: 4,
            schemaLink: '',
            imagesLinks: {}
        },
        mapPlacementTiles: {},
        playerAdminId: 'p1',
        teamColorList: [ '#FFF', '#000' ],
        staticPlayerList: [
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
        ],
        staticCharacterList: []
    })),
    playerJoin: jest.fn(),
    playerReady: jest.fn(),
    playerLeave: jest.fn(),
    teamJoin: jest.fn(),
    mapSelect: jest.fn(async () => {}),
    characterSelect: jest.fn(),
    characterRemove: jest.fn(),
    characterPlacement: jest.fn(),
    waitForBattle: jest.fn(async () => 'completed'),
    createBattle: jest.fn(async () => createFakeBattle()),
    removeBattle: jest.fn(),
    getCurrentBattleId: jest.fn(() => null)
});

export const getFakeRoomEntities = <S extends { new(...args: any[]): Service }>(serviceCreator: S) => {
    const socketCellP1 = createFakeSocketCell();
    const socketCellP2 = createFakeSocketCell();
    const socketCellP3 = createFakeSocketCell();
    const room = createFakeRoom();
    const globalEntities = createFakeGlobalEntitiesNoService(room);
    const service = new serviceCreator(globalEntities);

    const connectSocket = () => {
        service.onSocketConnect(socketCellP1, 'p1');
        service.onSocketConnect(socketCellP2, 'p2');
        service.onSocketConnect(socketCellP3, 'p3');
    };

    const expectPlayersAnswers = <M extends MessageWithResponseCreator<any, any>>(messageCreator: M) => {
        expect(socketCellP1.send).toHaveBeenCalledWith(messageCreator.createResponse(expect.anything(), room.getRoomStateData()));
        expect(socketCellP2.send).toHaveBeenCalledWith(RoomStateMessage(room.getRoomStateData()));
        expect(socketCellP1.send).not.toHaveBeenCalledWith(RoomStateMessage(room.getRoomStateData()));
    };

    const expectEveryPlayersReceived = <M extends Message<any>>(message: M) => {
        expect(socketCellP1.send).toHaveBeenCalledWith(message);
        expect(socketCellP2.send).toHaveBeenCalledWith(message);
        expect(socketCellP3.send).toHaveBeenCalledWith(message);
    };

    return { socketCellP1, socketCellP2, room, globalEntities, service, connectSocket, expectPlayersAnswers, expectEveryPlayersReceived };
};
