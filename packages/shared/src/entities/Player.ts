import { CharacterRoom } from "./Character";

export type PlayerInfos = {
    id: string;
    name: string;
};

export type PlayerEntity = {
    id: string;
    name: string;
    teamId: string;
};

export type PlayerSnapshot = {
    id: string;
    teamId: string;
    name: string;
};

export type PlayerRoom = {
    id: string;
    name: string;
    isAdmin: boolean;
    isReady: boolean;
    isLoading: boolean;
    characters: CharacterRoom[];
};

export const playerEntityToSnapshot = ({ id, name, teamId }: PlayerEntity): PlayerSnapshot => ({
    id,
    name,
    teamId
});
