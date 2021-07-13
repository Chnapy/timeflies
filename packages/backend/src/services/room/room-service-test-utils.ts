import { ObjectTyped } from '@timeflies/common';
import { MapInfos, Message, MessageWithResponseCreator, RoomStateData, RoomStateMessage } from '@timeflies/socket-messages';
import { assetUrl } from '../../utils/asset-url';
import { Service } from '../service';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../service-test-utils';
import { createServices } from '../services';
import { Room } from './room';

export const createFakeRoom = (): Room => ({
    roomId: 'room',

    mapInfos: {
        mapId: 'm1',
        name: 'm1',
        nbrTeams: 3,
        nbrTeamCharacters: 4,
        schemaLink: '',
        imagesLinks: {}
    },
    teamColorList: [ '#FFF', '#000' ],
    playerAdminId: 'p1',
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
    staticCharacterList: [],

    tiledMap: null,
    mapPlacementTiles: {},

    battle: null,

    cancelBattleLaunch: jest.fn()
});

export const getFakeRoomEntities = <S extends Service>(serviceCreator: { new(...args: any[]): S }) => {
    const socketCellP1 = createFakeSocketCell();
    const socketCellP2 = createFakeSocketCell();
    const socketCellP3 = createFakeSocketCell();
    const room = createFakeRoom();
    const globalEntities = createFakeGlobalEntitiesNoService(room);
    const service = new serviceCreator(globalEntities);
    service.services = createServices(globalEntities);

    const connectSocket = () => {
        service.onSocketConnect(socketCellP1, 'p1');
        service.onSocketConnect(socketCellP2, 'p2');
        service.onSocketConnect(socketCellP3, 'p3');
    };

    const getRoomStateData = ({
        roomId,
        mapInfos,
        teamColorList,
        playerAdminId,
        staticPlayerList,
        staticCharacterList,
        mapPlacementTiles
    }: Room): RoomStateData => ({
        roomId, teamColorList, playerAdminId, staticPlayerList, staticCharacterList, mapPlacementTiles,
        mapInfos: {
            ...mapInfos!,
            schemaLink: assetUrl.toFrontend(mapInfos!.schemaLink),
            imagesLinks: ObjectTyped.entries(mapInfos!.imagesLinks)
                .reduce<MapInfos[ 'imagesLinks' ]>((acc, [ key, value ]) => {
                    acc[ key ] = assetUrl.toFrontend(value);
                    return acc;
                }, {})
        }
    });

    const expectPlayersAnswers = <M extends MessageWithResponseCreator<any, any>>(messageCreator: M, roomStateData: RoomStateData = getRoomStateData(room)) => {
        expect(socketCellP1.send).toHaveBeenCalledWith(messageCreator.createResponse(expect.anything(), roomStateData));
        expect(socketCellP2.send).toHaveBeenCalledWith(RoomStateMessage(roomStateData));
        expect(socketCellP1.send).not.toHaveBeenCalledWith(RoomStateMessage(roomStateData));
    };

    const expectEveryPlayersReceived = <M extends Message<any>>(message: M) => {
        expect(socketCellP1.send).toHaveBeenCalledWith(message);
        expect(socketCellP2.send).toHaveBeenCalledWith(message);
        expect(socketCellP3.send).toHaveBeenCalledWith(message);
    };

    return { socketCellP1, socketCellP2, room, globalEntities, service, getRoomStateData, connectSocket, expectPlayersAnswers, expectEveryPlayersReceived };
};
