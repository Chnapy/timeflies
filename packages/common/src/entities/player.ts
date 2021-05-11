
export type PlayerId = string;

export type PlayerRelation = 'me' | 'ally' | 'enemy';

export type StaticPlayer = {
    playerId: PlayerId;
    playerName: string;
    teamColor: string;
};
