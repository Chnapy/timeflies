import { PlayerId, Position, StaticCharacter, StaticPlayer } from '@timeflies/common';

export type MapInfos = {
    mapId: string;
    name: string;
    nbrTeams: number;
    nbrTeamCharacters: number;
    schemaLink: string;
    imagesLinks: Record<string, string>;
};

export type MapPlacementTiles = { [ teamColor: string ]: Position[] };

export type RoomStaticPlayer = StaticPlayer & {
    ready: boolean;
};

export type RoomStaticCharacter = Omit<StaticCharacter, 'defaultSpellId'> & {
    placement: Position | null;
};

export type RoomStateData = {
    roomId: string;
    mapInfos: MapInfos | null;
    mapPlacementTiles: MapPlacementTiles;
    playerAdminId: PlayerId;
    teamColorList: string[];
    staticPlayerList: RoomStaticPlayer[];
    staticCharacterList: RoomStaticCharacter[];
};
