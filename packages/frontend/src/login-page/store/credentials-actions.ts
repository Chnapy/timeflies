import { createAction } from '@reduxjs/toolkit';
import { PlayerCredentials } from '@timeflies/socket-messages';

export type CredentialsLoginAction = ReturnType<typeof CredentialsLoginAction>;
export const CredentialsLoginAction = createAction<PlayerCredentials | null>('credentials/login');
