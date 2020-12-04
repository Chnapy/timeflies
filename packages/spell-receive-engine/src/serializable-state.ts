import { CharacterId, Orientation, Position, SpellId } from '@timeflies/common';

type CharacterVariables = {
    life: number;
    actionTime: number;
    position: Position;
    orientation: Orientation;
};

type SpellVariables = {
    duration: number;
    lineOfSight: boolean;
    rangeArea: number;
    actionArea: number;

    attack?: number;
    // more..
};

export type SerializableState = {
    checksum: string;
    characters: {
        [ characterId in CharacterId ]: CharacterVariables;
    };
    spells: {
        [ spellId in SpellId ]: SpellVariables;
    };
};
