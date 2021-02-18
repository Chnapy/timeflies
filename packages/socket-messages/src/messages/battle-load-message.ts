import { CharacterId, CharacterRole, CharacterVariables, PlayerId, SpellId, SpellRole, SpellVariables } from '@timeflies/common';
import { createMessage } from '../message';

type TiledMapLinks = {
    schema: string;
    images: Record<string, string>;
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
    defaultSpellRole: SpellRole;
    initialVariables: CharacterVariables;
};

type SpellData = {
    spellId: SpellId;
    characterId: CharacterId;
    spellRole: SpellRole;
    initialVariables: SpellVariables;
};

export type BattleLoadData = {
    myPlayerId: PlayerId;

    tiledMapLinks: TiledMapLinks;

    players: PlayerData[];

    characters: CharacterData[];

    spells: SpellData[];

    turnsOrder: CharacterId[];
    startTime: number;
};

export const BattleLoadMessage = createMessage<{ battleId: string }>('battle/load')
    .withResponse<BattleLoadData>();
