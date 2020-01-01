import { Spell, SpellType } from '../entities/Spell';
import { BattleScene } from '../scenes/BattleScene';
import { SpellAct } from './SpellAct';
import { SpellActMove } from './SpellActMove';
import { SpellActOrientate } from './SpellActOrientate';
import { SpellActSample1 } from './SpellActSample1';

export const getSpellAct = <T extends SpellType>(
    type: T,
    ...args: [ Spell, BattleScene ]
): SpellAct<T> => {

    switch (type) {
        case 'move':
            return new SpellActMove(...args);
        case 'orientate':
            return new SpellActOrientate(...args);
        default:
            return new SpellActSample1(...args);
    }

};
