
export type AuthRequestBody = {
    playerName: string;
};

export type AuthResponseBody = 
| {
    success: true;
    token: string;
}
| {
    success: false;
    error: 
    | 'player-name-exist'
    ;
};

export type WSQueryParams = {
    token: string;
};
