import { createReducer } from '@reduxjs/toolkit';
import { PlayerCredentials } from '@timeflies/socket-messages';
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

export const credentialsReducer = createReducer<PlayerCredentials | null>(getCredentials(), {
    [ CredentialsLoginAction.type ]: onCredentialsLoginAction,
    [ ErrorListAddAction.type ]: (state, { payload }: ErrorListAddAction) => {
        if (payload.code === 401) {
            return onCredentialsLoginAction(state, CredentialsLoginAction(null));
        }
    }
});
