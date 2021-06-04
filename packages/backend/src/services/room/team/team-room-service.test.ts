import { RoomTeamJoinMessage } from '@timeflies/socket-messages';
import { SocketError } from '@timeflies/socket-server';
import { createFakeRoom, getFakeRoomEntities } from '../room-service-test-utils';
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

            room.getRoomStateData = jest.fn(() => ({
                ...createFakeRoom().getRoomStateData(),
                staticPlayerList: [ {
                    playerId: 'p1',
                    playerName: '',
                    teamColor: '#000',
                    ready: true
                } ]
            }));

            expect(() =>
                listener(RoomTeamJoinMessage({
                    teamColor: '#FFF'
                }).get(), socketCellP1.send)
            ).toThrowError(SocketError);
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

        it('join team, before answering', async () => {
            const { socketCellP1, connectSocket, room } = getEntities();

            const callOrder: string[] = [];

            socketCellP1.send = jest.fn(message => callOrder.push(message.action));
            room.teamJoin = jest.fn(() => callOrder.push('team-join'));

            connectSocket();

            const listener = socketCellP1.getFirstListener(RoomTeamJoinMessage);

            await listener(RoomTeamJoinMessage({
                teamColor: '#FFF'
            }).get(), socketCellP1.send);

            expect(room.teamJoin).toHaveBeenCalledWith('p1', '#FFF');
            expect(callOrder).toEqual([ 'team-join', RoomTeamJoinMessage.action ]);
        });
    });

});
