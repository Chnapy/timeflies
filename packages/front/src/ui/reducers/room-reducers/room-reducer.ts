import { Reducer } from 'redux';
import { GameAction, IGameAction } from '../../../action/game-action/GameAction';
import { EntityTreeData, EntityTreeReducer } from './entity-tree-reducer/entity-tree-reducer';
import { MapSelectData, MapSelectReducer } from './map-select-reducer/map-select-reducer';

export interface RoomJoinAction extends IGameAction<'room/join'> {
    roomId: string;
}

export interface RoomCreateAction extends IGameAction<'room/create'> {

}

export interface RoomData {
    roomId: string;
    map: MapSelectData;
    teamsTree: EntityTreeData;
}

export const RoomReducer: Reducer<RoomData | null, GameAction> = (state = null, action) => {

    switch (action.type) {

        case 'message/receive':
            const { message } = action;
            if (message.type === 'room/state') {
                return {
                    roomId: message.roomId,
                    map: MapSelectReducer(undefined, action),
                    teamsTree: EntityTreeReducer(undefined, action)
                };
            }

            break;
    }

    return state && {
        ...state,
        map: MapSelectReducer(state.map, action),
        teamsTree: EntityTreeReducer(state.teamsTree, action)
    };
};
