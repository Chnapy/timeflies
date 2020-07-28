import { createReducer } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { ReceiveMessageAction } from '../../../socket/wsclient-actions';
import { EntityTreeData, entityTreeReducer } from './entity-tree-reducer/entity-tree-reducer';
import { MapSelectData, mapSelectReducer } from './map-select-reducer/map-select-reducer';


export type RoomData = {
    roomId: string;
    map: MapSelectData;
    teamsTree: EntityTreeData;
    launchTime: number | null;
};

export const RoomReducer = combineReducers<RoomData>({

    roomId: createReducer('', {
        [ ReceiveMessageAction.type ]: (state, { payload }: ReceiveMessageAction) => {
            if (payload.type === 'room/state') {
                return payload.roomId;
            }
        }
    }),

    map: mapSelectReducer,

    teamsTree: entityTreeReducer,

    launchTime: createReducer(null as RoomData[ 'launchTime' ], {
        [ ReceiveMessageAction.type ]: (state, { payload }: ReceiveMessageAction) => {
            if (payload.type === 'room/state') {
                return null;
            }

            if (payload.type === 'room/battle-launch') {
                return payload.action === 'launch'
                    ? payload.launchTime
                    : null;
            }
        }
    })

});
