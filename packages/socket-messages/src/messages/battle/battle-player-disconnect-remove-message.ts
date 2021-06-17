import { PlayerId } from '@timeflies/common';
import * as Joi from 'joi';
import { createMessage } from '../../message';

export type BattlePlayerDisconnectRemoveMessageData = {
    playersToRemove: PlayerId[];
    time: number;
};

export const BattlePlayerDisconnectRemoveMessage = createMessage<BattlePlayerDisconnectRemoveMessageData>('battle/player-disconnect/remove', Joi.any());
