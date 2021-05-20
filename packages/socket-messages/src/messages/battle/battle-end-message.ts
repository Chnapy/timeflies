import * as Joi from 'joi';
import { createMessage } from '../../message';

type BattleEndMessageData = {
    winnerTeamColor: string;
    endTime: number;
};

export const BattleEndMessage = createMessage<BattleEndMessageData>('battle/end', Joi.any());
