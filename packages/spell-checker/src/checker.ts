import { PlayerId, SerializableState, SpellAction } from '@timeflies/common';
import { SpellEffectFnContext } from '@timeflies/spell-effects';

type ClientContext = {
    playerId: PlayerId;
};

type Context = Omit<SpellEffectFnContext, 'state'> & {
    clientContext: ClientContext;
    state: SerializableState;
};

export type CheckerParams = {
    spellAction: SpellAction;
    context: Context;
    newState: SerializableState;
};

export type Checker = (params: CheckerParams) => boolean;
