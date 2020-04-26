import { TeamRoom } from '@timeflies/shared';
import { Reducer } from 'redux';
import { RoomAction } from '../../../action/game-action/room-action';

export interface EntityTreeData {
    teams: TeamRoom[];
}

const initialState: EntityTreeData = {
    teams: []
};

export const EntityTreeReducer: Reducer<EntityTreeData, RoomAction> = (state = initialState, action) => {

    return { ...state };
};
