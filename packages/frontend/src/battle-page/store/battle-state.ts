import { TimeFullProps } from '@timeflies/app-ui';
import { PlayerId, CharacterId, CharacterRole, SpellId, SpellRole, CharacterVariables, SpellVariables, CharacterVariableName, SpellVariableName } from '@timeflies/common';

export type StaticPlayer = {
    playerId: PlayerId;
    playerName: string;
    teamColor: string;
};

export type StaticCharacter = {
    characterId: CharacterId;
    playerId: PlayerId;
    characterRole: CharacterRole;
    defaultSpellRole: SpellRole;
};

export type CharacterVariablesMap = {
    [ name in CharacterVariableName ]: {
        [ characterId in CharacterId ]: CharacterVariables[ name ];
    };
};

export type StaticSpell = {
    spellId: SpellId;
    characterId: CharacterId;
    spellRole: SpellRole;
};

export type SpellVariablesMap = {
    [ name in SpellVariableName ]: {
        [ spellId in SpellId ]: SpellVariables[ name ];
    };
};

export type SpellAction = TimeFullProps & {
    spellId: SpellId;
};

export type BattleState = {
    myPlayerId: PlayerId;

    // players

    staticPlayers: { [ playerId in PlayerId ]: StaticPlayer };
    playerList: PlayerId[];

    // characters

    staticCharacters: { [ characterId in CharacterId ]: StaticCharacter };
    currentCharacters: CharacterVariablesMap;
    futureCharacters: CharacterVariablesMap;
    characterList: CharacterId[];

    playingCharacterId: CharacterId | null;

    // spells

    staticSpells: { [ spellId in SpellId ]: StaticSpell };
    currentSpells: SpellVariablesMap;
    futureSpells: SpellVariablesMap;
    spellLists: { [ characterId in CharacterId ]: SpellId[] };

    selectedSpellId: SpellId | null;

    spellActions: { [startTime in number]: SpellAction };
    spellActionList: number[];

    turnsOrder: CharacterId[];
    turnStartTime: number;
};
