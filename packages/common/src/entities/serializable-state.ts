import { CharacterId, CharacterVariables } from './character';
import { Checksum } from './checksum';
import { SpellId, SpellVariables } from './spell';

export type SerializableState = {
    checksum: Checksum;
    characters: {
        [ characterId in CharacterId ]: CharacterVariables;
    };
    spells: {
        [ spellId in SpellId ]: SpellVariables;
    };
};
