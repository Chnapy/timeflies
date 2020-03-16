import { Spell } from './Spell';
import { SpellSnapshot } from '@timeflies/shared';

describe('# Spell', () => {

    it('should return correct snapshot', () => {

        const snap: SpellSnapshot = {
            staticData: {
                id: 's1',
                color: 'red',
                name: 's-1',
                type: 'move',
                initialFeatures: {
                    area: 1,
                    attack: -1,
                    duration: 200
                }
            },
            features: {
                area: 1,
                attack: -1,
                duration: 300
            }
        };

        const spell = Spell(
            snap,
            {} as any
        );

        const snap2 = spell.getSnapshot();

        expect(snap2).toEqual<SpellSnapshot>(snap);

        // should not reference the same
        expect(snap2.features).not.toBe(snap.features);
    });

    it.todo('should update from snapshot correctly');
});
