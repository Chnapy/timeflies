import { number, object } from 'joi';
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
export const spellActionSchema = object<SpellAction>({
    spellId: spellIdSchema,
    targetPos: positionSchema,
    launchTime: number().required().integer().min(0),
    duration: number().required().integer().min(0),
    checksum: checksumSchema
});
