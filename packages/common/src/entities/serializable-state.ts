import { number, object } from 'joi';
import { CharacterVariablesMap, characterVariablesMapSchema } from './character';
import { Checksum, checksumSchema } from './checksum';
import { SpellVariablesMap, spellVariablesMapSchema } from './spell';

export type SerializableState = {
    checksum: Checksum;
    time: number;
    characters: CharacterVariablesMap;
    spells: SpellVariablesMap;
};
export const serializableStateSchema = object<SerializableState>({
    checksum: checksumSchema,
    time: number().required().integer().min(0),
    characters: characterVariablesMapSchema,
    spells: spellVariablesMapSchema
});
