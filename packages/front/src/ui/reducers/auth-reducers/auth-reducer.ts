import { createReducer } from "@reduxjs/toolkit";
import { ReceiveMessageAction } from "../../../socket/wsclient-actions";
import { PlayerCredentials } from "@timeflies/shared";

export type AuthState = {
    isAuth: boolean;
} & PlayerCredentials;

const initialState: AuthState = {
    isAuth: false,
    id: '',
    playerName: '',
    token: ''
};

export const authReducer = createReducer(initialState, {
    [ReceiveMessageAction.type]: (state, {payload}: ReceiveMessageAction) => {
        if(payload.type === 'auth/credentials') {
            return {
                isAuth: true,
                ...payload.credentials
            };
        }
    }
});
