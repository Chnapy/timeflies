import { SpellType } from '@timeflies/shared';
import { SpellAction } from '../spellAction/SpellActionManager';
import { spellLaunchMove } from './spellEngine/move/SpellPrepareMove';

const spellLaunchMap: {
    [ key in SpellType ]: (spellAction: SpellAction) => void;
} = {
    move: spellLaunchMove,
    orientate: () => {}
} as any;   // TODO

export const getSpellLaunchFn = (spellType: SpellType) => spellLaunchMap[spellType];