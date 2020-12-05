import { SpellRole } from '@timeflies/common';
import { moveEffect } from './effects/move-effect';
import { simpleAttackEffect } from './effects/simple-attack-effect';
import { switchEffect } from './effects/switch-effect';
import { SpellEffectFn } from './spell-effects-fn';

const spellEffectsMap: {
    [ spellRole in SpellRole ]: SpellEffectFn;
} = {
    'move': moveEffect,
    'simpleAttack': simpleAttackEffect,
    'switch': switchEffect,
};

export const getSpellEffectFn = (spellRole: SpellRole) => spellEffectsMap[ spellRole ];
