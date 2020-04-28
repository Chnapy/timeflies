import { RoomServerAction, TiledLayerTilelayer } from '@timeflies/shared';
import { ReceiveMessageAction } from '../../../../socket/WSClient';
import { MapSelectData, MapSelectReducer, MapLoadedAction } from './map-select-reducer';
import { StoreTest } from '../../../../StoreTest';
import { Controller } from '../../../../Controller';
import { seedTiledMap } from '../../../../stages/battle/map/TiledMap.seed';
import { MapBoardTileInfos } from '../../../room-ui/map-board/map-board-tile/map-board-tile';

describe('# map-select-reducer', () => {

    const getAction = (roomMessage: RoomServerAction): ReceiveMessageAction<RoomServerAction> => ({
        type: 'message/receive',
        message: roomMessage
    });

    it('should return the good initial state', () => {

        expect(
            MapSelectReducer(undefined, { type: 'not-matter' } as any)
        )
            .toEqual<MapSelectData>({
                mapList: [],
                mapSelected: null
            });
    });

    it('should ignore not handled actions', () => {

        const action = { type: 'not-handled' };

        expect(
            MapSelectReducer({
                mapList: [],
                mapSelected: null
            }, action as any)
        ).toEqual<MapSelectData>({
            mapList: [],
            mapSelected: null
        });

        const messageAction: ReceiveMessageAction<any> = {
            type: 'message/receive',
            message: {
                type: 'not-handled'
            }
        };

        expect(
            MapSelectReducer({
                mapList: [],
                mapSelected: null
            }, messageAction)
        ).toEqual<MapSelectData>({
            mapList: [],
            mapSelected: null
        });
    });

    it('should update tile list on map list action', () => {

        const action = getAction({
            type: 'room/map/list',
            sendTime: -1,
            mapList: [ {
                id: 'm1',
                schemaUrl: '',
                name: '',
                height: 10,
                width: 10,
                nbrCharactersPerTeam: 1,
                nbrTeams: 1,
                previewUrl: ''
            } ]
        });

        const state: MapSelectData = {
            mapList: [],
            mapSelected: null
        };

        expect(
            MapSelectReducer(state, action)
        ).toEqual<MapSelectData>({
            mapList: [ {
                id: 'm1',
                schemaUrl: '',
                name: '',
                height: 10,
                width: 10,
                nbrCharactersPerTeam: 1,
                nbrTeams: 1,
                previewUrl: ''
            } ],
            mapSelected: null
        });
    });

    it('should set map selected null on map selected "null" action', () => {

        const action = getAction({
            type: 'room/map/select',
            sendTime: -1,
            mapSelected: null,
            teams: []
        });

        const state: MapSelectData = {
            mapList: [],
            mapSelected: {
                id: '',
                tileList: [],
                tileListLoading: false
            }
        };

        expect(
            MapSelectReducer(state, action)
        ).toEqual<MapSelectData>({
            mapList: [],
            mapSelected: null
        });
    });

    it('should set map selected null on map selected "null" action', () => {

        const action = getAction({
            type: 'room/map/select',
            sendTime: -1,
            mapSelected: null,
            teams: []
        });

        const state: MapSelectData = {
            mapList: [],
            mapSelected: {
                id: '',
                tileList: [],
                tileListLoading: false
            }
        };

        expect(
            MapSelectReducer(state, action)
        ).toEqual<MapSelectData>({
            mapList: [],
            mapSelected: null
        });
    });

    it('should set map selected on map selected action and start map load', async () => {

        const action = getAction({
            type: 'room/map/select',
            sendTime: -1,
            mapSelected: {
                id: 'm1',
                placementTiles: [ {
                    teamId: 't1',
                    position: { x: 1, y: 1 }
                }, {
                    teamId: 't2',
                    position: { x: 2, y: 2 }
                } ]
            },
            teams: []
        });

        const state: MapSelectData = {
            mapList: [ {
                id: 'm1',
                name: 'm1',
                width: 10,
                height: 10,
                schemaUrl: 'map',
                nbrTeams: 1,
                nbrCharactersPerTeam: 1,
                previewUrl: ''
            } ],
            mapSelected: null
        };

        expect(
            MapSelectReducer(state, action)
        ).toEqual<MapSelectData>({
            mapList: [ {
                id: 'm1',
                name: 'm1',
                width: 10,
                height: 10,
                schemaUrl: 'map',
                nbrTeams: 1,
                nbrCharactersPerTeam: 1,
                previewUrl: ''
            } ],
            mapSelected: {
                id: 'm1',
                tileListLoading: true,
                tileList: [
                    {
                        type: 'placement',
                        teamId: 't1',
                        position: { x: 1, y: 1 }
                    },
                    {
                        type: 'placement',
                        teamId: 't2',
                        position: { x: 2, y: 2 }
                    }
                ]
            }
        });

        await Controller.loader.newInstance().load();

        expect(StoreTest.getActions()).toEqual<[ MapLoadedAction ]>([ {
            type: 'room/map/loaded',
            assets: expect.anything()
        } ]);
    });

    it('should add obstacles on map loaded action', () => {

        const schema = seedTiledMap('map_1');

        const action: MapLoadedAction = {
            type: 'room/map/loaded',
            assets: {
                images: {},
                schema
            }
        };

        const state: MapSelectData = {
            mapList: [ {
                id: 'm1',
                name: 'm1',
                width: 10,
                height: 10,
                schemaUrl: 'map',
                nbrTeams: 1,
                nbrCharactersPerTeam: 1,
                previewUrl: ''
            } ],
            mapSelected: {
                id: 'm1',
                tileListLoading: true,
                tileList: [ {
                    type: 'placement',
                    teamId: 't1',
                    position: { x: 0, y: 0 }
                } ]
            }
        };

        const nbrObstacles: number = schema.layers
            .find((l): l is TiledLayerTilelayer => l.name === 'obstacles')!
            .data!.filter(d => !!d).length;

        const newState = MapSelectReducer(state, action);

        expect(newState).toEqual<MapSelectData>({
            mapList: [ {
                id: 'm1',
                name: 'm1',
                width: 10,
                height: 10,
                schemaUrl: 'map',
                nbrTeams: 1,
                nbrCharactersPerTeam: 1,
                previewUrl: ''
            } ],
            mapSelected: {
                id: 'm1',
                tileListLoading: false,
                tileList: expect.arrayContaining<MapBoardTileInfos>([ {
                    type: 'placement',
                    teamId: 't1',
                    position: { x: 0, y: 0 }
                }, {
                    type: 'obstacle',
                    position: expect.any(Object)
                } ])
            }
        });

        expect(newState.mapSelected!.tileList).toHaveLength(nbrObstacles + 1);
    });
});
