import { SpellAction } from '@timeflies/common';
import { SpellEffect } from '@timeflies/spell-effects';
import * as Joi from 'joi';
import { createMessage } from '../../message';

type BattleNotifyMessageData = {
    spellAction: SpellAction;
    spellEffect: SpellEffect;
};

export const BattleNotifyMessage = createMessage<BattleNotifyMessageData>('battle/notify', Joi.any());
