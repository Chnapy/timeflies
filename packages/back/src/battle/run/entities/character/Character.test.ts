import { Character } from './Character';
import { seedPlayer } from '../player/Player.seed';
import { StaticCharacter, OmitFn } from '@timeflies/shared';
import { Spell } from '../spell/Spell';

describe('# Character', () => {

    it('should update from snapshot correctly', () => {

        const player = seedPlayer();

        const staticData: StaticCharacter = {
            id: 'c1',
            type: 'sampleChar1',
            name: 'c-1',
            initialFeatures: {
                life: 100,
                actionTime: 2000
            },
            staticSpells: [ { id: 's1' } as any ],
            defaultSpellId: ''
        };

        const updateFromSnapshot = jest.fn();

        const spellCreator: typeof Spell = () => ({
            updateFromSnapshot
        } as any);

        const character = Character(staticData, { x: 1, y: 1 }, player, { spellCreator });

        character.updateFromSnapshot({
            id: 'c1',
            staticData,
            features: {
                life: 70,
                actionTime: 500
            },
            orientation: 'right',
            position: { x: 64, y: 25 },
            spellsSnapshots: [ { id: 's1' } as any ]
        });

        expect(character).toMatchObject<OmitFn<Character, 'player' | 'isAlive' | 'spells'>>({
            id: 'c1',
            staticData,
            features: {
                life: 70,
                actionTime: 500
            },
            orientation: 'right',
            position: { x: 64, y: 25 },
        });
        expect(updateFromSnapshot).toHaveBeenCalledTimes(1);
    });
});
