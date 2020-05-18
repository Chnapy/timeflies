import { SpellActionSnapshot } from './Spell';

export const seedSpellActionSnapshot = (spellId: string, partial: Partial<SpellActionSnapshot> = {}): SpellActionSnapshot => ({
    spellId,
    actionArea: [],
    battleHash: '',
    characterId: '',
    duration: -1,
    position: { x: -1, y: -1 },
    startTime: -1,
    ...partial
});
