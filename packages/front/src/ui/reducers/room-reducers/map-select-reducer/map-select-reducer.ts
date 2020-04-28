import { Reducer } from 'redux';
import { GameAction, IGameAction } from '../../../../action/game-action/GameAction';
import { MapBoardTileInfos } from '../../../room-ui/map-board/map-board-tile/map-board-tile';
import { MapConfig, assertIsDefined, TiledMapAssets, TiledManager, RoomServerAction, assertIsNonNullable } from '@timeflies/shared';
import { Controller } from '../../../../Controller';
import { serviceDispatch } from '../../../../services/serviceDispatch';

export interface MapLoadedAction extends IGameAction<'room/map/loaded'> {
    assets: TiledMapAssets;
}

export interface MapSelectData {
    mapList: MapConfig[];
    mapSelected: {
        id: MapConfig[ 'id' ];
        tileListLoading: boolean;
        tileList: MapBoardTileInfos[];
    } | null;
}

const initialData: MapSelectData = {
    mapList: [],
    mapSelected: null
};

type SubReducer<A> = (state: MapSelectData, action: A) => MapSelectData;

const reduceMapList: SubReducer<RoomServerAction.MapList> = (state, { mapList }) => {
    return {
        ...state,
        mapList
    };
};

const reduceMapSelect: SubReducer<RoomServerAction.MapSelect> = (state, { mapSelected }) => {

    if (!mapSelected) {
        return {
            ...state,
            mapSelected: null
        };
    }

    const { mapList } = state;

    const config = mapList.find(m => m.id === mapSelected.id);
    assertIsDefined(config);

    const { dispatchMapLoaded } = serviceDispatch({
        dispatchMapLoaded: (assets: TiledMapAssets): MapLoadedAction => ({
            type: 'room/map/loaded',
            assets
        })
    });

    Controller.loader.newInstance()
        .add('map', config.schemaUrl)
        .load()
        .then(({ map }) => {
            dispatchMapLoaded(map);
        });

    return {
        ...state,
        mapSelected: {
            id: mapSelected.id,
            tileListLoading: true,
            tileList: mapSelected.placementTiles.map(({ position, teamId }) => ({
                type: 'placement',
                position,
                teamId
            }))
        }
    };
};

const reduceMapLoaded: SubReducer<MapLoadedAction> = (state, action) => {

    const { mapSelected } = state;
    assertIsNonNullable(mapSelected);

    const { assets } = action;

    const tiledManager = TiledManager(assets);

    const obstacleTiles = tiledManager.getAllTilesOfType('obstacle');

    return {
        ...state,
        mapSelected: {
            ...mapSelected,
            tileListLoading: false,
            tileList: [
                ...mapSelected.tileList,
                ...obstacleTiles
            ]
        }
    };
};

export const MapSelectReducer: Reducer<MapSelectData, GameAction> = (state = initialData, action) => {

    switch (action.type) {
        case 'message/receive':

            const { message } = action;

            switch (message.type) {

                case 'room/map/list':
                    return reduceMapList(state, message);

                case 'room/map/select':
                    return reduceMapSelect(state, message);

            }
            break;

        case 'room/map/loaded':
            return reduceMapLoaded(state, action);
    }

    return { ...state };
};
