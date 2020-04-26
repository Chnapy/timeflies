import { Reducer } from 'redux';
import { GameAction } from '../../../../action/game-action/GameAction';
import { MapBoardTileInfos } from '../../../room-ui/map-board/map-board-tile/map-board-tile';
import { MyMapConfig } from '../../../room-ui/map-selector/map-selector';

export interface MapSelectData {
    mapList: MyMapConfig[];
    mapSelected: {
        id: MyMapConfig[ 'id' ];
        tileList: MapBoardTileInfos[];
    } | null;
}

const initialData: MapSelectData = {
    mapList: [],
    mapSelected: null
};

export const MapSelectReducer: Reducer<MapSelectData, GameAction> = (state = initialData, action) => {

    switch (action.type) {
        case 'message/receive':
            if (action.message.type === 'room/state') {
                const { map } = action.message;
                return {
                    ...state,
                    mapList: map.mapList as any,
                    mapSelected: map.mapSelectedId
                        ? {
                            id: map.mapSelectedId,
                            tileList: []    // TODO
                        }
                        : null
                }
            }
            break;
    }


    return { ...state };
};
