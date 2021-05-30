import Joi from 'joi';
import { createMessage } from '../../message';

export const RoomBattleStartMessage = createMessage<{ battleId: string }>('room/battle/start', Joi.object());
