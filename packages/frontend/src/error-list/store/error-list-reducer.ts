import { createReducer } from '@reduxjs/toolkit';
import { createId, switchUtil } from '@timeflies/common';
import { ErrorReason } from '@timeflies/socket-messages';
import { disconnectErrors } from '../../login-page/store/credentials-reducer';
import { ErrorListAddAction, ErrorListRemoveAction } from './error-list-actions';

export type ErrorItem = {
    id: string;
    time: number;
    message: string;
};

export type ErrorListMap = { [ id in string ]: ErrorItem };

const ignoredErrorReasons: ErrorReason[] = [ ...disconnectErrors ];

export const errorListReducer = createReducer<ErrorListMap>({}, {
    [ ErrorListAddAction.type ]: (state, { payload }: ErrorListAddAction) => {

        if (ignoredErrorReasons.includes(payload.reason)) {
            return;
        }

        const messageContent = switchUtil(payload.reason, {
            'bad-request': 'something wrong with data sent',
            'token-invalid': '',
            'token-expired': '',
            'bad-server-state': 'you cannot do this action',
            'internal-error': 'an unknown error has occured'
        });

        const errorItem: ErrorItem = {
            id: createId(),
            time: Date.now(),
            message: `Error ${payload.reason}: ${messageContent}`
        };
        state[ errorItem.id ] = errorItem;
    },
    [ ErrorListRemoveAction.type ]: (state, { payload }: ErrorListRemoveAction) => {
        delete state[ payload.errorId ];
    }
});
