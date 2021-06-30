import * as Joi from 'joi';
import { createMessage } from '../../message';

export const BattleLeaveMessage = createMessage('battle/leave', Joi.any());
