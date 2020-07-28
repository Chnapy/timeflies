import { createReducer } from '@reduxjs/toolkit';
import { assertIsDefined, assertIsNonNullable, MapConfig, MapPlacementTile, RoomServerAction, TiledManager } from '@timeflies/shared';
import { ReceiveMessageAction } from '../../../../socket/wsclient-actions';
import { MapBoardTileInfos } from '../../../room-ui/map-board/map-board-tile/map-board-tile';
import { RoomStartAction } from '../room-actions';
import { MapLoadedAction } from './map-select-actions';

export interface MapSelectData {
    mapList: MapConfig[];
    mapSelected: {
        id: MapConfig[ 'id' ];
        tileListLoading: boolean;
        tileList: MapBoardTileInfos[];
    } | null;
}

const initialState: MapSelectData = {
    mapList: [],
    mapSelected: null
};

type SubReducer<A> = (state: MapSelectData, action: A) => void;

const handleMapSelect = (
    state: MapSelectData,
    mapConfig: MapConfig | null, placementTileList: MapPlacementTile[]
) => {
    if (!mapConfig) {

        state.mapSelected = null;
    } else {

        state.mapSelected = {
            id: mapConfig.id,
            tileListLoading: true,
            tileList: placementTileList.map(({ position, teamId }) => ({
                type: 'placement',
                position,
                teamId
            }))
        };
    }
};

const reduceMapList: SubReducer<RoomServerAction.MapList> = (state, { mapList }) => {
    state.mapList = mapList;
};

const reduceMapSelect: SubReducer<RoomServerAction.MapSelect> = (state, { mapSelected }) => {

    if (!mapSelected) {
        handleMapSelect(state, null, []);
    } else {

        const { mapList } = state;

        const config = mapList.find(m => m.id === mapSelected.id);
        assertIsDefined(config);

        handleMapSelect(state, config, mapSelected.placementTileList);
    }
};

export const mapSelectReducer = createReducer(initialState, {

    // TODO consider remove
    [ RoomStartAction.type ]: (state, { payload }: RoomStartAction) => {

        const { mapSelected } = payload.roomState;

        if (!mapSelected) {
            handleMapSelect(state, null, []);
        } else {
            state.mapList = [ mapSelected.config ];
            handleMapSelect(state, mapSelected.config, mapSelected.placementTileList);
        }
    },
    [ ReceiveMessageAction.type ]: (state, { payload }: ReceiveMessageAction) => {

        switch (payload.type) {

            case 'room/state':
                const { mapSelected } = payload;
        
                if (!mapSelected) {
                    handleMapSelect(state, null, []);
                } else {
                    state.mapList = [ mapSelected.config ];
                    handleMapSelect(state, mapSelected.config, mapSelected.placementTileList);
                }
                return;

            case 'room/map/list':
                return reduceMapList(state, payload);

            case 'room/map/select':
                return reduceMapSelect(state, payload);

        }
    },
    [ MapLoadedAction.type ]: (state, { payload }: MapLoadedAction) => {

        const { mapSelected } = state;
        assertIsNonNullable(mapSelected);

        const { assets } = payload;

        const tiledManager = TiledManager(assets.schema);

        const obstacleTiles = tiledManager.getAllTilesOfType('obstacle');

        Object.assign(state.mapSelected, {
            tileListLoading: false,
            tileList: [
                ...obstacleTiles,
                ...mapSelected.tileList
            ]
        });
    }
});
