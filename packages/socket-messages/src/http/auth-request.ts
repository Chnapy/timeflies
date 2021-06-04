import { PlayerId } from '@timeflies/common';
import Joi from 'joi';

export const authEndpoint = '/auth';

export type PlayerCredentials = {
    playerId: PlayerId;
    playerName: string;
    token: string;
};

export type AuthRequestBody = {
    playerName: string;
};
export const authRequestBodySchema = Joi.object<AuthRequestBody>({
    playerName: Joi.string().required().min(3).max(12)
});

export type AuthResponseBody =
    | {
        success: true;
        playerCredentials: PlayerCredentials;
    }
    | {
        success: false;
        errors: string[];
    };

export type SocketQueryParams = {
    token: string;
};
export const socketQueryParamsSchema = Joi.object<SocketQueryParams>({
    token: Joi.string().required()
});
