import { RoomTeamJoinMessage } from '@timeflies/socket-messages';
import { SocketError } from '@timeflies/socket-server';
import { getFakeRoomEntities } from '../room-service-test-utils';
import { TeamRoomService } from './team-room-service';

describe('team room service', () => {

    const getEntities = () => getFakeRoomEntities(TeamRoomService);

    describe('on team join message', () => {

        it('throw error if team color does not exist', () => {
            const { socketCellP1, connectSocket } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomTeamJoinMessage);

            expect(() =>
                listener(RoomTeamJoinMessage({
                    teamColor: 'wrong-team-color'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('throw error if player is ready', () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomTeamJoinMessage);

            room.staticPlayerList = [ {
                playerId: 'p1',
                playerName: '',
                teamColor: '#000',
                ready: true,
                type: 'player'
            } ];

            expect(() =>
                listener(RoomTeamJoinMessage({
                    teamColor: '#FFF'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
        });

        it('join team', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomTeamJoinMessage);

            await listener(RoomTeamJoinMessage({
                teamColor: '#FFF'
            }).get(), socketCellP1.send);

            expect(room.staticPlayerList.find(p => p.playerId === 'p1')!.teamColor).toEqual('#FFF');
        });

        it('answers with room state, and send update to other players', async () => {
            const { socketCellP1, connectSocket, expectPlayersAnswers } = getEntities();

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomTeamJoinMessage);

            await listener(RoomTeamJoinMessage({
                teamColor: '#FFF'
            }).get(), socketCellP1.send);

            expectPlayersAnswers(RoomTeamJoinMessage);
        });
    });

    it('get room team color list if map infos defined', () => {
        const { service, room } = getEntities();

        room.mapInfos = {
            mapId: '',
            name: '',
            schemaLink: '',
            imagesLinks: {},
            nbrTeams: 2,
            nbrTeamCharacters: 1
        };

        expect(service.getRoomTeamColorList(room)).toEqual([ '#3BA92A', '#FFD74A' ]);
    });
});
