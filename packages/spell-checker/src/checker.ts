import { CharacterId, CharacterRole, PlayerId, SerializableState, SpellAction, SpellId, SpellRole } from '@timeflies/common';

type ClientContext = {
    playerId: PlayerId;
};

type TurnContext = {
    playerId: PlayerId;
    characterId: CharacterId;
    startTime: number;
    endTime: number;
};

type StaticState = {
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

type MapContext = {
    // consider use tilemap-utils
};

type Context = {
    clientContext: ClientContext;
    currentTurn: TurnContext;
    state: SerializableState;
    staticState: StaticState;
    map: MapContext;
};

export type CheckerParams = {
    spellAction: SpellAction;
    context: Context;
    newState: SerializableState;
};

export type Checker = (params: CheckerParams) => boolean;
