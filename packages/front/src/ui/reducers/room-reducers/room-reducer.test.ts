import { Controller } from '../../../Controller';
import { ReceiveMessageAction } from '../../../socket/WSClient';
import { RoomData, RoomReducer } from './room-reducer';
import { StageChangeAction } from '../../../stages/StageManager';

// TODO refactor all reducer tests to be less 'duck', more 'user though'
// Also use redux-act or other, 
// to improve reducer & action structure all over the app
// https://dev.to/hbarcelos/a-better-approach-for-testing-your-redux-code-2ec9

// TODO consider using redux-toolkit for mutable state problematic

// TODO use redux state in pixi object

// TODO also handle promises to totally avoid free-promises

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

    it('should init state on stage change action', async () => {

        const action: StageChangeAction<'room'> = {
            type: 'stage/change',
            stageKey: 'room',
            payload: {
                roomState: {
                    type: 'room/state',
                    sendTime: -1,
                    roomId: 'id',
                    mapSelected: null,
                    playerList: [],
                    teamList: []
                }
            }
        };

        expect(
            RoomReducer(null, action)
        ).toMatchObject<RoomData>({
            roomId: 'id',
            map: expect.any(Object),
            teamsTree: expect.any(Object),
            launchTime: null
        });

        await Controller.loader.newInstance().load();
    });
});
