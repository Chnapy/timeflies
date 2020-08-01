
export type AuthRequestBody = {
    playerName: string;
};

export type AuthResponseBodyError = 
| 'player-name-exist'
;

export type AuthResponseBody = {
    token: string;
    error?: AuthResponseBodyError;
};

export type WSQueryParams = {
    token: string;
};

export const authEndpoint = '/auth';
