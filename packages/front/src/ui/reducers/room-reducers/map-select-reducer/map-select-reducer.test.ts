import { MapConfig, RoomServerAction, seedTiledMap, createPosition } from '@timeflies/shared';
import { TiledLayerTilelayer } from 'tiled-types';
import { ReceiveMessageAction } from '../../../../socket/wsclient-actions';
import { MapBoardTileInfos } from '../../../room-ui/map-board/map-board-tile/map-board-tile';
import { RoomStartAction } from '../room-actions';
import { MapLoadedAction } from './map-select-actions';
import { MapSelectData, mapSelectReducer } from './map-select-reducer';

describe('# map-select-reducer', () => {

    const getAction = (roomMessage: RoomServerAction) => ReceiveMessageAction(roomMessage);

    it('should return the good initial state', () => {

        expect(
            mapSelectReducer(undefined, { type: 'not-matter' } as any)
        )
            .toEqual<MapSelectData>({
                mapList: [],
                mapSelected: null
            });
    });

    it('should ignore not handled actions', () => {

        const action = { type: 'not-handled' };

        expect(
            mapSelectReducer({
                mapList: [],
                mapSelected: null
            }, action as any)
        ).toEqual<MapSelectData>({
            mapList: [],
            mapSelected: null
        });

        const messageAction = ReceiveMessageAction({
            type: 'not-handled'
        } as any);

        expect(
            mapSelectReducer({
                mapList: [],
                mapSelected: null
            }, messageAction)
        ).toEqual<MapSelectData>({
            mapList: [],
            mapSelected: null
        });
    });

    it('should init state on room start', () => {

        const mapConfig: MapConfig = {
            id: '',
            schemaUrl: 'placeholder',
            height: 10,
            width: 10,
            name: '',
            nbrCharactersPerTeam: 1,
            nbrTeams: 1,
            previewUrl: '',
        };

        const action = RoomStartAction({
            roomState: {
                type: 'room/state',
                sendTime: -1,
                roomId: '',
                mapSelected: {
                    config: mapConfig,
                    placementTileList: [ {
                        teamId: 't1',
                        position: createPosition(0, 0)
                    } ]
                },
                playerList: [],
                teamList: []
            }
        });

        expect(
            mapSelectReducer(undefined, action)
        ).toMatchObject<MapSelectData>({
            mapList: [ mapConfig ],
            mapSelected: {
                id: mapConfig.id,
                tileListLoading: true,
                tileList: [ {
                    type: 'placement',
                    teamId: 't1',
                    position: createPosition(0, 0)
                } ]
            }
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
            mapSelectReducer(state, action)
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
            teamList: [],
            playerList: []
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
            mapSelectReducer(state, action)
        ).toEqual<MapSelectData>({
            mapList: [],
            mapSelected: null
        });
    });

    it('should set map selected on map selected action', async () => {

        const action = getAction({
            type: 'room/map/select',
            sendTime: -1,
            mapSelected: {
                id: 'm1',
                placementTileList: [ {
                    teamId: 't1',
                    position: createPosition(1, 1)
                }, {
                    teamId: 't2',
                    position: createPosition(2, 2)
                } ]
            },
            teamList: [],
            playerList: []
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
            mapSelectReducer(state, action)
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
                        position: createPosition(1, 1)
                    },
                    {
                        type: 'placement',
                        teamId: 't2',
                        position: createPosition(2, 2)
                    }
                ]
            }
        });

        // await Controller.loader.newInstance().load();

        // expect(StoreTest.getActions()).toEqual<[ MapLoadedAction ]>([ {
        //     type: 'room/map/loaded',
        //     assets: expect.anything()
        // } ]);
    });

    it('should add obstacles on map loaded action', () => {

        const schema = seedTiledMap('map_1');

        const action = MapLoadedAction({
            assets: {
                images: {},
                schema
            }
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
            mapSelected: {
                id: 'm1',
                tileListLoading: true,
                tileList: [ {
                    type: 'placement',
                    teamId: 't1',
                    position: createPosition(0, 0)
                } ]
            }
        };

        const nbrObstacles: number = schema.layers
            .find((l): l is TiledLayerTilelayer => l.name === 'obstacles')!
            .data!.filter(d => !!d).length;

        const newState = mapSelectReducer(state, action);

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
                    position: createPosition(0, 0)
                }, {
                    type: 'obstacle',
                    position: expect.any(Object)
                } ])
            }
        });

        expect(newState.mapSelected!.tileList).toHaveLength(nbrObstacles + 1);
    });
});
