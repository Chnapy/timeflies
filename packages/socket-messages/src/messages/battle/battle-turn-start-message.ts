import { CharacterId } from '@timeflies/common';
import { createMessage } from '../../message';

export type BattleTurnStartData = {
    characterId: CharacterId;
    startTime: number;
    roundIndex: number;
    turnIndex: number;
};

export const BattleTurnStartMessage = createMessage<BattleTurnStartData>('battle/turn-start');
