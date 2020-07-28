import { ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { RoomData, RoomReducer } from './room-reducer';

// TODO refactor all reducer tests to be less 'duck', more 'user though'
// https://dev.to/hbarcelos/a-better-approach-for-testing-your-redux-code-2ec9

describe('# room-reducer', () => {

    const getInitialState = (): RoomData => ({
        roomId: '',
        map: expect.any(Object),
        teamsTree: expect.any(Object),
        launchTime: null
    });

    it('should return the good initial state', () => {

        expect(
            RoomReducer(undefined, { type: 'not-matter' })
        ).toEqual(getInitialState());
    });

    it('should ignore not handled actions', () => {

        const actionMessage: ReceiveMessageAction = ReceiveMessageAction({
            type: 'not-matter'
        } as any);

        expect(
            RoomReducer(undefined, actionMessage)
        ).toEqual(getInitialState());
    });

    it('should init state on room state message', () => {

        const action = ReceiveMessageAction({
            type: 'room/state',
            sendTime: -1,
            roomId: 'id',
            mapSelected: null,
            playerList: [],
            teamList: []
        });

        expect(
            RoomReducer(undefined, action)
        ).toMatchObject<RoomData>({
            ...getInitialState(),
            roomId: 'id'
        });
    });
});
