import { SpellActionSnapshot } from './Spell';
import { createPosition } from '../geo';

export const seedSpellActionSnapshot = (spellId: string, partial: Partial<SpellActionSnapshot> = {}): SpellActionSnapshot => ({
    spellId,
    actionArea: [],
    battleHash: '',
    characterId: '',
    duration: -1,
    position: createPosition(-1, -1),
    startTime: -1,
    ...partial
});
