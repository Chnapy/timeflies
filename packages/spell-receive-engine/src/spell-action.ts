import { SpellId } from '@timeflies/common';

type Checksum = string;

export type SpellAction = {
    spellId: SpellId;
    targetPos: Position;
    launchTime: number;
    checksum: Checksum;
};
