import * as joi from 'joi';
import { Position, positionSchema } from '../geo';
import { Checksum, checksumSchema } from './checksum';
import { SpellId, spellIdSchema } from './spell';

export type SpellAction = {
    spellId: SpellId;
    targetPos: Position;
    launchTime: number;
    duration: number;
    checksum: Checksum;
};
export const spellActionSchema = joi.object<SpellAction>({
    spellId: spellIdSchema,
    targetPos: positionSchema,
    launchTime: joi.number().required().integer().min(0),
    duration: joi.number().required().integer().min(0),
    checksum: checksumSchema
});
