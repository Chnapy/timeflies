import { RoomServerAction } from '@timeflies/shared';
import { ReceiveMessageAction } from '../../../../socket/WSClient';
import { EntityTreeData, EntityTreeReducer } from './entity-tree-reducer';

describe('# entity-tree-reducer', () => {

    const getAction = (roomMessage: RoomServerAction): ReceiveMessageAction<RoomServerAction> => ({
        type: 'message/receive',
        message: roomMessage
    });

    it('should start with correct initial state', () => {
        expect(
            EntityTreeReducer(undefined, { type: 'not-matter' } as any)
        ).toEqual<EntityTreeData>({
            playerList: [],
            teamList: []
        });
    });

    it('should ignore not handled actions', () => {

        const action = { type: 'not-handled' };

        expect(
            EntityTreeReducer({
                playerList: [],
                teamList: []
            }, action as any)
        ).toEqual<EntityTreeData>({
            playerList: [],
            teamList: []
        });

        const messageAction: ReceiveMessageAction<any> = {
            type: 'message/receive',
            message: {
                type: 'not-handled'
            }
        };

        expect(
            EntityTreeReducer({
                playerList: [],
                teamList: []
            }, messageAction)
        ).toEqual<EntityTreeData>({
            playerList: [],
            teamList: []
        });
    });

    it('should init state on room state action', () => {

        const action: ReceiveMessageAction<RoomServerAction.RoomState> = {
            type: 'message/receive',
            message: {
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
        };

        expect(
            EntityTreeReducer(undefined, action)
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
            EntityTreeReducer(state, action)
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
            EntityTreeReducer(state, action)
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
            EntityTreeReducer(state, action)
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
            EntityTreeReducer(state, action)
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
                    type: 'sampleChar1',
                    position: { x: -1, y: -1 }
                } ]
            } ],
            teamList: [ {
                id: 't-1',
                letter: 'A',
                playersIds: []
            } ]
        };

        expect(
            EntityTreeReducer(state, action)
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
                type: 'sampleChar1',
                position: { x: -1, y: -1 }
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
            EntityTreeReducer(state, action)
        ).toEqual<EntityTreeData>({
            playerList: [ {
                id: 'p-1',
                name: 'p1',
                isAdmin: false,
                isLoading: false,
                isReady: false,
                characters: [ {
                    id: 'c-1',
                    type: 'sampleChar1',
                    position: { x: -1, y: -1 }
                } ]
            } ],
            teamList: []
        });
    });
});
