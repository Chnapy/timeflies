import { object, string } from 'joi';

export type PlayerId = string;
export const playerIdSchema = string().required().min(1);

export type PlayerRelation = typeof playerRelationList[ number ];
export const playerRelationList = [ 'me', 'ally', 'enemy' ] as const;
export const playerRelationSchema = playerRelationList;

export type StaticPlayer = {
    playerId: PlayerId;
    playerName: string;
    teamColor: string;
};
export const staticPlayerSchema = object<StaticPlayer>({
    playerId: playerIdSchema,
    playerName: string().required().min(1),
    teamColor: string().required().min(1)
});
