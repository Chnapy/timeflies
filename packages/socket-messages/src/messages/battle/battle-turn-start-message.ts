import { CharacterId, characterIdSchema } from '@timeflies/common';
import * as joi from 'joi';
import { createMessage } from '../../message';

export type BattleTurnStartData = {
    characterId: CharacterId;
    startTime: number;
    roundIndex: number;
    turnIndex: number;
};

export const BattleTurnStartMessage = createMessage('battle/turn-start', joi.object<BattleTurnStartData>({
    characterId: characterIdSchema,
    startTime: joi.number().required().integer().min(0),
    roundIndex: joi.number().required().integer().min(0),
    turnIndex: joi.number().required().integer().min(0)
}));
