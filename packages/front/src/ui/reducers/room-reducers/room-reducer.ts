import { Reducer } from 'redux';
import { IGameAction } from '../../../action/game-action/GameAction';
import { RoomAction } from '../../../action/game-action/room-action';
import { EntityTreeData, EntityTreeReducer } from './entity-tree-reducer';
import { MapSelectData, MapSelectReducer } from './map-select-reducer/map-select-reducer';

export interface RoomJoinAction extends IGameAction<'room/join'> {
    roomId: string;
}

export interface RoomCreateAction extends IGameAction<'room/create'> {

}

export interface RoomData {
    map: MapSelectData;
    teamsTree: EntityTreeData;
}

export const RoomReducer: Reducer<RoomData | null, RoomAction> = (state = null, action) => {

    switch (action.type) {
        case 'room/join':
        case 'room/create':
            return {
                map: MapSelectReducer(undefined, action),
                teamsTree: EntityTreeReducer(undefined, action)
            };
    }

    return state && {
        ...state,
        map: MapSelectReducer(state.map, action),
        teamsTree: EntityTreeReducer(state.teamsTree, action)
    };
};
