import { SpellRole } from '@timeflies/common';
import { CheckTileFn } from './compute-range-area';
import { attractionEffect } from './effects/attraction-effect';
import { bloodSharingEffect } from './effects/blood-sharing-effect';
import { distractionEffect } from './effects/distraction-effect';
import { lastResortEffect } from './effects/last-resort-effect';
import { motivationEffect } from './effects/motivation-effect';
import { moveEffect } from './effects/move-effect';
import { sideAttackEffect } from './effects/side-attack-effect';
import { simpleAttackEffect } from './effects/simple-attack-effect';
import { slumpEffect } from './effects/slump-effect';
import { switchEffect } from './effects/switch-effect';
import { swordStingEffect } from './effects/sword-sting-effect';
import { treacherousBlowEffect } from './effects/treacherous-blow-effect';
import { SpellEffectItem } from './spell-effects-fn';

const defaultRangeAreaFn: CheckTileFn = () => true;

const spellEffectsMap: { [ spellRole in SpellRole ]: SpellEffectItem } = {
    'simpleAttack': simpleAttackEffect,

    'move': moveEffect,
    'sword-sting': swordStingEffect,
    'side-attack': sideAttackEffect,
    'blood-sharing': bloodSharingEffect,

    'switch': switchEffect,
    'treacherous-blow': treacherousBlowEffect,
    'attraction': attractionEffect,
    'distraction': distractionEffect,

    'slump': slumpEffect,
    'last-resort': lastResortEffect,
    'motivation': motivationEffect
};

export const getSpellEffectFn = (spellRole: SpellRole) => spellEffectsMap[ spellRole ].effect;

export const getSpellRangeAreaFn = (spellRole: SpellRole) => spellEffectsMap[ spellRole ].rangeArea ?? defaultRangeAreaFn;
