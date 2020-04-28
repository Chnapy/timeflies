import { RoomReducer } from './room-reducer';
import { ReceiveMessageAction } from '../../../socket/WSClient';
import { RoomServerAction } from '@timeflies/shared';

// TODO refactor all reducer tests to be less 'duck', more 'user though'
// Also use redux-act or other, 
// to improve reducer & action structure all over the app
// https://dev.to/hbarcelos/a-better-approach-for-testing-your-redux-code-2ec9

describe('# room-reducer', () => {

    it('should return the good initial state', () => {

        expect(
            RoomReducer(undefined, { type: 'not-matter' } as any)
        ).toBe(null);
    });

    it('should ignore not handled actions', () => {

        expect(
            RoomReducer(null, { type: 'not-matter' } as any)
        ).toBe(null);

        const actionMessage: ReceiveMessageAction<any> = {
            type: 'message/receive',
            message: {
                type: 'not-matter'
            }
        };

        expect(
            RoomReducer(null, actionMessage)
        ).toBe(null);
    });

    it('should init state on room create action', () => {

        const action: ReceiveMessageAction<RoomServerAction.RoomCreate> = {
            type: 'message/receive',
            message: {
                type: 'room/create',
                sendTime: -1
            }
        };

        expect(
            RoomReducer(null, action)
        ).toMatchObject({});
    });
});
