import { TAction } from '../TAction';
import { PlayerCredentials } from './auth-common';

export type AuthServerAction =
    | AuthServerAction.Credentials
    ;

export module AuthServerAction {

    export type Credentials = TAction<'auth/credentials'> & {
        credentials: PlayerCredentials;
    };

}
