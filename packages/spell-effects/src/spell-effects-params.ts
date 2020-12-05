import { CharacterId, CharacterRole, CharacterVariables, PlayerId, Position, SerializableState, SpellAction, SpellId, SpellRole, SpellVariables } from '@timeflies/common';

export type SpellEffectCharacters = {
    [ characterId in CharacterId ]: Partial<CharacterVariables>;
};

export type SpellEffectSpells = {
    [ spellId in SpellId ]: Partial<SpellVariables>;
};

export type SpellEffect = {
    characters?: SpellEffectCharacters;
    spells?: SpellEffectSpells;
};

export type TurnContext = {
    playerId: PlayerId;
    characterId: CharacterId;
    startTime: number;
    endTime: number;
};

export type StaticState = {
    characters: {
        [ characterId in CharacterId ]: {
            id: CharacterId;
            role: CharacterRole;
        };
    };
    spells: {
        [ spellId in SpellId ]: {
            id: SpellId;
            characterId: CharacterId;
            spellType: SpellRole;
        };
    };
};

export type MapContext = {
    actionArea: Position[];
};

export type SpellEffectFnContext = {
    currentTurn: TurnContext;
    state: SerializableState;
    staticState: StaticState;
    map: MapContext;
};

export type SpellEffectFnParams = {
    spellAction: SpellAction;
    context: SpellEffectFnContext;
};
