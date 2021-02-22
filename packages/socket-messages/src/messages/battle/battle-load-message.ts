import { CharacterId, CharacterRole, CharacterVariables, PlayerId, SpellId, SpellRole, SpellVariables } from '@timeflies/common';
import { createMessage } from '../../message';

type TiledMapInfos = {
    name: string;
    schemaLink: string;
    imagesLinks: Record<string, string>;
};

type PlayerData = {
    playerId: PlayerId;
    playerName: string;
    teamColor: string;
};

type CharacterData = {
    characterId: CharacterId;
    playerId: PlayerId;
    characterRole: CharacterRole;
    defaultSpellId: SpellId;
    initialVariables: CharacterVariables;
};

type SpellData = {
    spellId: SpellId;
    characterId: CharacterId;
    spellRole: SpellRole;
    initialVariables: SpellVariables;
};

type TurnInfos = {
    turnsOrder: CharacterId[];
    startTime: number;
    roundIndex: number;
    turnIndex: number;
};

export type BattleLoadData = {
    myPlayerId: PlayerId;

    tiledMapInfos: TiledMapInfos;

    players: PlayerData[];

    characters: CharacterData[];

    spells: SpellData[];

    turnInfos: TurnInfos;
};

export const BattleLoadMessage = createMessage<{ battleId: string }>('battle/load')
    .withResponse<BattleLoadData>();
