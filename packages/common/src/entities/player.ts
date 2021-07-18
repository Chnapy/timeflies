import * as joi from 'joi';

export type PlayerId = string;
export const playerIdSchema = joi.string().required().min(1);

export type PlayerRelation = typeof playerRelationList[ number ];
export const playerRelationList = [ 'me', 'ally', 'enemy' ] as const;
export const playerRelationSchema = playerRelationList;

export type PlayerType = typeof playerTypeList[ number ];
export const playerTypeList = [ 'player', 'spectator', 'ai' ] as const;
export const playerTypeSchema = playerTypeList;

export type StaticPlayer = {
    playerId: PlayerId;
    playerName: string;
    teamColor: string | null;
    type: PlayerType;
};
export const staticPlayerSchema = joi.object<StaticPlayer>({
    playerId: playerIdSchema,
    playerName: joi.string().required().min(1),
    teamColor: joi.string().allow(null).required(),
    type: playerTypeSchema
});
