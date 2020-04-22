import { Reducer } from 'redux';
import { GameAction, IGameAction } from '../../../action/GameAction';
import { MapSelectData, MapSelectReducer, MapSelectAction } from './map-select-reducer';

export interface RoomJoinAction extends IGameAction<'room/join'> {
    roomId: string;
}

export interface RoomCreateAction extends IGameAction<'room/create'> {

}

export type RoomAction =
    | RoomJoinAction
    | RoomCreateAction
    | MapSelectAction;

export interface RoomData {
    map: MapSelectData;
}

export const RoomReducer: Reducer<RoomData | null, GameAction> = (state = null, action) => {

    switch (action.type) {
        case 'room/join':
        case 'room/create':
            return {
                map: MapSelectReducer(undefined, action)
            };
    }

    return state && {
        ...state,
        map: MapSelectReducer(state.map, action)
    };
};
