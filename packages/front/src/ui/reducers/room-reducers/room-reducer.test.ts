import { ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { RoomStartAction } from './room-actions';
import { RoomData, RoomReducer } from './room-reducer';

// TODO refactor all reducer tests to be less 'duck', more 'user though'
// https://dev.to/hbarcelos/a-better-approach-for-testing-your-redux-code-2ec9

// TODO also handle promises to totally avoid free-promises

describe('# room-reducer', () => {

    it('should return the good initial state', () => {

        expect(
            RoomReducer(undefined, { type: 'not-matter' } as any)
        ).toBe(null);
    });

    it('should ignore not handled actions', () => {

        expect(
            RoomReducer(undefined, { type: 'not-matter' } as any)
        ).toBe(null);

        const actionMessage: ReceiveMessageAction = ReceiveMessageAction({
            type: 'not-matter'
        } as any);

        expect(
            RoomReducer(undefined, actionMessage)
        ).toBe(null);
    });

    it('should init state on room start', () => {

        const action = RoomStartAction({
            roomState: {
                type: 'room/state',
                sendTime: -1,
                roomId: 'id',
                mapSelected: null,
                playerList: [],
                teamList: []
            }
        });

        expect(
            RoomReducer(undefined, action)
        ).toMatchObject<RoomData>({
            roomId: 'id',
            map: expect.any(Object),
            teamsTree: expect.any(Object),
            launchTime: null
        });
    });
});
