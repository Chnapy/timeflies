import { SerializableState, SpellAction } from '@timeflies/common';
import { createMessage } from '../../message';

export type BattleSpellActionData = {
    spellAction: SpellAction;
};

export type BattleSpellActionResponseData =
    | { success: true }
    | {
        success: false;
        lastState: SerializableState;
    };

export const BattleSpellActionMessage = createMessage<BattleSpellActionData>('battle/spell-action')
    .withResponse<BattleSpellActionResponseData>();
