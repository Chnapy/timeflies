import { createReducer } from '@reduxjs/toolkit';
import { createId, switchUtil } from '@timeflies/common';
import { ErrorListAddAction, ErrorListRemoveAction } from './error-list-actions';

export type ErrorItem = {
    id: string;
    time: number;
    message: string;
};

export type ErrorListMap = { [ id in string ]: ErrorItem };

export const errorListReducer = createReducer<ErrorListMap>({}, {
    [ ErrorListAddAction.type ]: (state, { payload }: ErrorListAddAction) => {

        const messageContent = switchUtil(payload.code, {
            400: 'something wrong with data sent',
            401: 'you need to login',
            403: 'you don\'t have rights for this action',
            500: 'an unknown error has occured'
        });

        const errorItem: ErrorItem = {
            id: createId(),
            time: Date.now(),
            message: `Error ${payload.code}: ${messageContent}`
        };
        state[ errorItem.id ] = errorItem;
    },
    [ ErrorListRemoveAction.type ]: (state, { payload }: ErrorListRemoveAction) => {
        delete state[ payload.errorId ];
    }
});
