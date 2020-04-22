import { Reducer } from 'redux';
import { GameAction, IGameAction } from '../../../action/GameAction';
import { MyMapConfig } from '../../room-ui/map-selector/map-selector';

export interface MapSelectAction extends IGameAction<'room/map/select'> {
    mapSelected: MyMapConfig[ 'id' ];
}

export interface MapSelectData {
    mapListLoading: boolean;
    mapList: MyMapConfig[];
    mapSelected: MyMapConfig[ 'id' ] | null;
}

const initialData: MapSelectData = {
    mapListLoading: false,
    mapList: [],
    mapSelected: null
};

export const MapSelectReducer: Reducer<MapSelectData, GameAction> = (state = initialData, action) => {

    switch(action.type) {
        case 'room/map/select':
            return {
                ...state,
                mapSelected: action.mapSelected
            };
    }


    return { ...state };
};
