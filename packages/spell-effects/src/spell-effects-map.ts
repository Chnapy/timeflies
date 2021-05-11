import { SpellRole } from '@timeflies/common';
import { CheckTileFn } from './compute-range-area';
import { moveEffect } from './effects/move-effect';
import { simpleAttackEffect } from './effects/simple-attack-effect';
import { switchEffect } from './effects/switch-effect';
import { SpellEffectItem } from './spell-effects-fn';

const defaultRangeAreaFn: CheckTileFn = () => true;

const spellEffectsMap: { [ spellRole in SpellRole ]: SpellEffectItem } = {
    'move': moveEffect,
    'simpleAttack': simpleAttackEffect,
    'switch': switchEffect,
};

export const getSpellEffectFn = (spellRole: SpellRole) => spellEffectsMap[ spellRole ].effect;

export const getSpellRangeAreaFn = (spellRole: SpellRole) => spellEffectsMap[ spellRole ].rangeArea ?? defaultRangeAreaFn;
