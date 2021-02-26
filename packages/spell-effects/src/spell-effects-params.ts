import { CharacterId, CharacterVariables, PlayerId, Position, SerializableState, SpellAction, SpellId, SpellVariables, StaticCharacter, StaticSpell } from '@timeflies/common';
import { TiledMap } from 'tiled-types';

export type SpellEffectCharacters = {
    [ characterId in CharacterId ]: Partial<CharacterVariables>;
};

export type SpellEffectSpells = {
    [ spellId in SpellId ]: Partial<SpellVariables>;
};

export type SpellEffect = {
    actionArea: Position[];
    duration: number;
    characters?: SpellEffectCharacters;
    spells?: SpellEffectSpells;
};

export type TurnContext = {
    playerId: PlayerId;
    characterId: CharacterId;
    startTime: number;
};

export type StaticState = {
    characters: { [ characterId in CharacterId ]: Pick<StaticCharacter, 'characterId' | 'characterRole'> };
    spells: { [ spellId in SpellId ]: Pick<StaticSpell, 'spellId' | 'characterId' | 'spellRole'> };
};

export type MapContext = {
    tiledMap: TiledMap;
    rangeArea: Position[];
};

export type SpellEffectFnContext = {
    currentTurn: TurnContext;
    state: Omit<SerializableState, 'checksum'>;
    staticState: StaticState;
    map: MapContext;
};

export type ParamPartialSpellAction = Omit<SpellAction, 'checksum' | 'duration'>;  // duration may be computed by effect

export type SpellEffectFnParams = {
    partialSpellAction: ParamPartialSpellAction;
    context: SpellEffectFnContext;
};
