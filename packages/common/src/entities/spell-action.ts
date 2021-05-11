import { Position } from '../geo';
import { Checksum } from './checksum';
import { SpellId } from './spell';

export type SpellAction = {
    spellId: SpellId;
    targetPos: Position;
    launchTime: number;
    duration: number;
    checksum: Checksum;
};
