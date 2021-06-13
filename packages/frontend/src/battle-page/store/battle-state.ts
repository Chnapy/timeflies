import { CharacterId, PlayerId, SerializableState, SpellAction, SpellId, StaticCharacter, StaticPlayer, StaticSpell } from '@timeflies/common';
import { SpellEffect } from '@timeflies/spell-effects';

export type BattleState = {
    roomId: string;

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
    initialSerializableState: SerializableState;
    serializableStates: { [ startTime in number ]: SerializableState };
    serializableStateList: number[];
    spellActionEffects: {
        [ startTime in number ]: {
            spellAction: SpellAction;
            spellEffect: SpellEffect;
        };
    };
    spellActionEffectList: number[];

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
