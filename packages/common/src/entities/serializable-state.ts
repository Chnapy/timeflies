import { CharacterVariablesMap } from './character';
import { Checksum } from './checksum';
import { SpellVariablesMap } from './spell';

export type SerializableState = {
    checksum: Checksum;
    time: number;
    characters: CharacterVariablesMap;
    spells: SpellVariablesMap;
};
