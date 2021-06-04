import * as joi from 'joi';
import { CharacterVariablesMap, characterVariablesMapSchema } from './character-details';
import { Checksum, checksumSchema } from './checksum';
import { SpellVariablesMap, spellVariablesMapSchema } from './spell';

export type SerializableState = {
    checksum: Checksum;
    time: number;
    characters: CharacterVariablesMap;
    spells: SpellVariablesMap;
};
export const serializableStateSchema = joi.object<SerializableState>({
    checksum: checksumSchema,
    time: joi.number().required().integer().min(0),
    characters: characterVariablesMapSchema,
    spells: spellVariablesMapSchema
});
