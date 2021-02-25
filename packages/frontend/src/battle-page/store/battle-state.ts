import { CharacterId, PlayerId, SerializableState, SpellAction, SpellId, StaticCharacter, StaticPlayer, StaticSpell } from '@timeflies/common';

export type BattleState = {
    myPlayerId: PlayerId;

    tiledMapInfos: {
        name: string;
        schemaLink: string;
    };

    // players

    staticPlayers: { [ playerId in PlayerId ]: StaticPlayer };
    playerList: PlayerId[];

    // characters

    staticCharacters: { [ characterId in CharacterId ]: StaticCharacter };
    characterList: CharacterId[];

    // serializable

    currentTime: number;
    serializableStates: { [ startTime in number ]: SerializableState };
    serializableStateList: number[];
    spellActions: { [ startTime in number ]: SpellAction };
    spellActionList: number[];

    // spells

    staticSpells: { [ spellId in SpellId ]: StaticSpell };
    spellLists: { [ characterId in CharacterId ]: SpellId[] };


    selectedSpellId: SpellId | null;

    turnsOrder: CharacterId[];
    turnStartTime: number;
    playingCharacterId: CharacterId | null;
    roundIndex: number;
    turnIndex: number;
};
