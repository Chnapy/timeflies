import { createReducer } from '@reduxjs/toolkit';
import { PlayerCredentials } from '@timeflies/socket-messages';
import { CredentialsLoginAction } from './credentials-actions';

const storageCredentialsKey = 'credentials';

const getCredentials = (): PlayerCredentials | null => {
    const credentialsRaw = localStorage.getItem(storageCredentialsKey);
    return credentialsRaw && JSON.parse(credentialsRaw);
};

export const credentialsReducer = createReducer<PlayerCredentials | null>(getCredentials(), {
    [ CredentialsLoginAction.type ]: (state, { payload }: CredentialsLoginAction) => {
        localStorage.setItem(storageCredentialsKey, JSON.stringify(payload));
        return payload;
    }
});
