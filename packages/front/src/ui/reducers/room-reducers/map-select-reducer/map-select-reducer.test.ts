import { RoomServerAction } from '@timeflies/shared';
import { MapSelectData, MapSelectReducer } from './map-select-reducer';

describe('# map-select-reducer', () => {

    const getInitialState = (): MapSelectData => ({
        mapList: [],
        mapSelected: null
    });

    it('should return the good initial state', () => {

        expect(
            MapSelectReducer(undefined, { type: 'not-matter' } as any)
        )
            .toEqual(getInitialState());
    });

    it('should handle room/state server action', () => {

        const actionServer: RoomServerAction.RoomState = {
            type: 'room/state',
            sendTime: -1,
            map: {
                mapList: [ {
                    id: 'm1',
                    defaultTilelayerName: '',
                    initLayerName: '',
                    obstacleTilelayerName: '',
                    schemaUrl: ''
                } ],
                mapSelectedId: 'm1'
            },
            teamsTree: null as any
        };

        expect(
            MapSelectReducer(getInitialState(), {
                type: 'message/receive',
                message: actionServer
            })
        )
            .toEqual<MapSelectData>({
                mapList: [ {
                    id: 'm1',
                    defaultTilelayerName: '',
                    initLayerName: '',
                    obstacleTilelayerName: '',
                    schemaUrl: ''
                } ] as any,
                mapSelected: {
                    id: 'm1',
                    tileList: []
                }
            });
    });
});
