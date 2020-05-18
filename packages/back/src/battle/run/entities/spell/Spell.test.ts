import { Spell } from './Spell';
import { seedCharacter } from '../character/Character.seed';
import { StaticSpell, OmitFn } from '@timeflies/shared';

describe('# Spell', () => {

    it('should update from snapshot correctly', () => {

        const character = seedCharacter()[ 0 ];

        const staticData: StaticSpell = {
            id: 's1',
            type: 'move',
            name: 's-1',
            initialFeatures: {
                area: 5,
                attack: 2,
                duration: 200
            }
        };

        const spell = Spell(staticData, character);

        spell.updateFromSnapshot({
            id: 's1',
            staticData,
            features: {
                area: 10,
                attack: 4,
                duration: 400
            }
        });

        expect(spell).toMatchObject<OmitFn<Spell>>({
            id: 's1',
            staticData,
            character,
            features: {
                area: 10,
                attack: 4,
                duration: 400
            }
        });
    });

});
