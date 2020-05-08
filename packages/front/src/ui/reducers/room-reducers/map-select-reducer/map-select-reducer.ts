import { assertIsDefined, assertIsNonNullable, MapConfig, MapPlacementTile, RoomServerAction, TiledManager, TiledMapAssets } from '@timeflies/shared';
import { Reducer } from 'redux';
import { GameAction, IGameAction } from '../../../../action/game-action/GameAction';
import { StageChangeAction } from '../../../../stages/StageManager';
import { MapBoardTileInfos } from '../../../room-ui/map-board/map-board-tile/map-board-tile';

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

const handleMapSelect = (
    state: MapSelectData,
    mapConfig: MapConfig | null, placementTileList: MapPlacementTile[]
): MapSelectData => {
    if (!mapConfig) {
        return {
            ...state,
            mapSelected: null
        };
    }

    return {
        ...state,
        mapSelected: {
            id: mapConfig.id,
            tileListLoading: true,
            tileList: placementTileList.map(({ position, teamId }) => ({
                type: 'placement',
                position,
                teamId
            }))
        }
    };
};

const reduceRoomState: SubReducer<StageChangeAction<'room'>> = (state, {
    payload: { roomState: { mapSelected } }
}) => {
    if (!mapSelected) {
        return handleMapSelect(state, null, []);
    }

    return handleMapSelect({
        ...state,
        mapList: [ mapSelected.config ]
    }, mapSelected.config, mapSelected.placementTileList);
};

const reduceMapList: SubReducer<RoomServerAction.MapList> = (state, { mapList }) => {
    return {
        ...state,
        mapList
    };
};

const reduceMapSelect: SubReducer<RoomServerAction.MapSelect> = (state, { mapSelected }) => {

    if (!mapSelected) {
        return handleMapSelect(state, null, []);
    }

    const { mapList } = state;

    const config = mapList.find(m => m.id === mapSelected.id);
    assertIsDefined(config);

    return handleMapSelect(state, config, mapSelected.placementTileList);
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
                ...obstacleTiles,
                ...mapSelected.tileList
            ]
        }
    };
};

export const MapSelectReducer: Reducer<MapSelectData, GameAction> = (state = initialData, action) => {

    switch (action.type) {
        case 'stage/change':
            if (action.stageKey === 'room') {
                return reduceRoomState(state, action as StageChangeAction<'room'>);
            }
            break;

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
