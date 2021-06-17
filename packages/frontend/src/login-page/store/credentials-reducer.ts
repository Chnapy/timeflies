import { createReducer } from '@reduxjs/toolkit';
import { ErrorReason, PlayerCredentials } from '@timeflies/socket-messages';
import { ErrorListAddAction } from '../../error-list/store/error-list-actions';
import { CredentialsLoginAction } from './credentials-actions';

const storageCredentialsKey = 'credentials';

const getCredentials = (): PlayerCredentials | null => {
    const credentialsRaw = localStorage.getItem(storageCredentialsKey);
    return credentialsRaw && JSON.parse(credentialsRaw);
};

const onCredentialsLoginAction = (state: PlayerCredentials | null, { payload }: CredentialsLoginAction) => {
    localStorage.setItem(storageCredentialsKey, JSON.stringify(payload));
    return payload;
};

export const disconnectErrors: ErrorReason[] = [ 'token-invalid', 'token-expired' ];

export const credentialsReducer = createReducer<PlayerCredentials | null>(getCredentials(), {
    [ CredentialsLoginAction.type ]: onCredentialsLoginAction,
    [ ErrorListAddAction.type ]: (state, { payload }: ErrorListAddAction) => {
        if (disconnectErrors.includes(payload.reason)) {
            return onCredentialsLoginAction(state, CredentialsLoginAction(null));
        }
    }
});
