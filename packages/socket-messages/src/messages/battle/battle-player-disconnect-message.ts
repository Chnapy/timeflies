import { PlayerId } from '@timeflies/common';
import * as Joi from 'joi';
import { createMessage } from '../../message';

export type BattlePlayerDisconnectMessageData = {
    playerId: PlayerId;
};

export const BattlePlayerDisconnectMessage = createMessage<BattlePlayerDisconnectMessageData>('battle/player-disconnect', Joi.any());
