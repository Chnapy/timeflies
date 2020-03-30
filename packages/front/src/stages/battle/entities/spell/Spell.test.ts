import { SpellSnapshot } from '@timeflies/shared';
import { seedSpell, seedSpellSnapshot } from './Spell.seed';

describe('# Spell', () => {

    it('should return correct snapshot', () => {

        const snapshot = seedSpellSnapshot({
            id: 's1',
            type: 'move',
            features: {}
        });

        const spell = seedSpell('real', {
            id: snapshot.id,
            type: snapshot.staticData.type,
            initialFeatures: snapshot.staticData.initialFeatures,
            character: null as any
        });

        const snap2 = spell.getSnapshot();

        expect(snap2).toEqual<SpellSnapshot>(snapshot);

        // should not reference the same
        expect(snap2.features).not.toBe(snapshot.features);
    });

    it.todo('should update from snapshot correctly');
});
