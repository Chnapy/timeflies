import { createAction } from "@reduxjs/toolkit";
import { PlayerCredentials, AuthRequestBody } from "@timeflies/shared";

export type AuthFormSubmit = ReturnType<typeof AuthFormSubmit>;
export const AuthFormSubmit = createAction<AuthRequestBody>('auth/form/submit');

export type AuthHttpSuccess = ReturnType<typeof AuthHttpSuccess>;
export const AuthHttpSuccess = createAction<
    Pick<PlayerCredentials, 'playerName' | 'token'>
>('auth/http/success');
