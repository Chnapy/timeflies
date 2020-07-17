import { RoomServerAction, createPosition } from '@timeflies/shared';
import { ReceiveMessageAction } from '../../../../socket/wsclient-actions';
import { RoomStartAction } from '../room-actions';
import { EntityTreeData, entityTreeReducer } from './entity-tree-reducer';

describe('# entity-tree-reducer', () => {

    const getAction = (roomMessage: RoomServerAction): ReceiveMessageAction => ({
        type: 'message/receive',
        payload: roomMessage
    });

    it('should start with correct initial state', () => {
        expect(
            entityTreeReducer(undefined, { type: 'not-matter' } as any)
        ).toEqual<EntityTreeData>({
            playerList: [],
            teamList: []
        });
    });

    it('should ignore not handled actions', () => {

        const action = { type: 'not-handled' };

        expect(
            entityTreeReducer({
                playerList: [],
                teamList: []
            }, action as any)
        ).toEqual<EntityTreeData>({
            playerList: [],
            teamList: []
        });

        const messageAction: ReceiveMessageAction = {
            type: 'message/receive',
            payload: {
                type: 'not-handled'
            } as any
        };

        expect(
            entityTreeReducer({
                playerList: [],
                teamList: []
            }, messageAction)
        ).toEqual<EntityTreeData>({
            playerList: [],
            teamList: []
        });
    });

    it('should init state on stage change action', () => {

        const action = RoomStartAction({
            roomState: {
                type: 'room/state',
                sendTime: -1,
                roomId: '',
                mapSelected: null,
                playerList: [ {
                    id: 'p1',
                    name: 'p1',
                    isAdmin: true,
                    isLoading: false,
                    isReady: false,
                    characters: []
                } ],
                teamList: [ {
                    id: 't1',
                    letter: 'A',
                    playersIds: [ 'p1' ]
                } ]
            }
        });

        expect(
            entityTreeReducer(undefined, action)
        ).toMatchObject<EntityTreeData>({
            playerList: [
                {
                    id: 'p1',
                    name: 'p1',
                    isAdmin: true,
                    isLoading: false,
                    isReady: false,
                    characters: []
                }
            ],
            teamList: [
                {
                    id: 't1',
                    letter: 'A',
                    playersIds: [ 'p1' ]
                }
            ]
        });
    });

    it('should update teams on map select', () => {

        const action = getAction({
            type: 'room/map/select',
            sendTime: -1,
            mapSelected: null,
            teamList: [ {
                id: 't-1',
                letter: 'A',
                playersIds: []
            } ],
            playerList: []
        });

        const state: EntityTreeData = {
            playerList: [],
            teamList: [ {
                id: 't-temp',
                letter: 'B',
                playersIds: []
            } ]
        };

        expect(
            entityTreeReducer(state, action)
        ).toEqual<EntityTreeData>({
            playerList: [],
            teamList: [ {
                id: 't-1',
                letter: 'A',
                playersIds: []
            } ]
        });
    });

    it('should remove player on player set "remove" and update teams', () => {

        const action = getAction({
            type: 'room/player/set',
            sendTime: -1,
            action: 'remove',
            playerId: 'p-1',
            reason: 'leave',
            teamList: [ {
                id: 't-1',
                letter: 'A',
                playersIds: []
            } ],
            playerList: [ {
                id: 'p-2',
                name: 'p2',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: []
            } ]
        });

        const state: EntityTreeData = {
            playerList: [ {
                id: 'p-1',
                name: 'p1',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: []
            }, {
                id: 'p-2',
                name: 'p2',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: []
            } ],
            teamList: []
        };

        expect(
            entityTreeReducer(state, action)
        ).toEqual<EntityTreeData>({
            playerList: [ {
                id: 'p-2',
                name: 'p2',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: []
            } ],
            teamList: [ {
                id: 't-1',
                letter: 'A',
                playersIds: []
            } ]
        });
    });

    it('should add player on player set "add" and update teams', () => {

        const action = getAction({
            type: 'room/player/set',
            sendTime: -1,
            action: 'add',
            player: {
                id: 'p-1',
                isAdmin: false,
                isLoading: true,
                isReady: true,
                name: 'p1',
                characters: []
            },
            teamList: [ {
                id: 't-1',
                letter: 'A',
                playersIds: []
            } ]
        });

        const state: EntityTreeData = {
            playerList: [],
            teamList: []
        };

        expect(
            entityTreeReducer(state, action)
        ).toEqual<EntityTreeData>({
            playerList: [ {
                id: 'p-1',
                isAdmin: false,
                isLoading: true,
                isReady: true,
                name: 'p1',
                characters: []
            } ],
            teamList: [ {
                id: 't-1',
                letter: 'A',
                playersIds: []
            } ]
        });
    });

    it('should update player on player refresh', () => {

        const action = getAction({
            type: 'room/player/refresh',
            sendTime: -1,
            player: {
                id: 'p-1',
                isAdmin: false,
                isLoading: true,
                isReady: true,
            }
        });

        const state: EntityTreeData = {
            playerList: [ {
                id: 'p-1',
                isAdmin: true,
                isLoading: false,
                isReady: false,
                name: 'p1',
                characters: []
            } ],
            teamList: []
        };

        expect(
            entityTreeReducer(state, action)
        ).toEqual<EntityTreeData>({
            playerList: [ {
                id: 'p-1',
                isAdmin: false,
                isLoading: true,
                isReady: true,
                name: 'p1',
                characters: []
            } ],
            teamList: []
        });
    });

    it('should remove character on character set "remove" and update teams', () => {

        const action = getAction({
            type: 'room/character/set',
            sendTime: -1,
            action: 'remove',
            playerId: 'p-1',
            characterId: 'c-1',
            teamList: []
        });

        const state: EntityTreeData = {
            playerList: [ {
                id: 'p-1',
                name: 'p1',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: [ {
                    id: 'c-1',
                    type: 'tacka',
                    position: createPosition(-1, -1)
                } ]
            } ],
            teamList: [ {
                id: 't-1',
                letter: 'A',
                playersIds: []
            } ]
        };

        expect(
            entityTreeReducer(state, action)
        ).toEqual<EntityTreeData>({
            playerList: [ {
                id: 'p-1',
                name: 'p1',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: []
            } ],
            teamList: []
        });
    });

    it('should add character on character set "add" and update teams', () => {

        const action = getAction({
            type: 'room/character/set',
            sendTime: -1,
            action: 'add',
            playerId: 'p-1',
            character: {
                id: 'c-1',
                type: 'tacka',
                position: createPosition(-1, -1)
            },
            teamList: []
        });

        const state: EntityTreeData = {
            playerList: [ {
                id: 'p-1',
                name: 'p1',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: []
            } ],
            teamList: [ {
                id: 't-1',
                letter: 'A',
                playersIds: []
            } ]
        };

        expect(
            entityTreeReducer(state, action)
        ).toEqual<EntityTreeData>({
            playerList: [ {
                id: 'p-1',
                name: 'p1',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: [ {
                    id: 'c-1',
                    type: 'tacka',
                    position: createPosition(-1, -1)
                } ]
            } ],
            teamList: []
        });
    });
});
