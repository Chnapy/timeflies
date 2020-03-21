import { CharacterFeatures, CharacterSnapshot, Orientation, Position, SpellSnapshot, StaticCharacter } from "@timeflies/shared";
import { StoreTest } from '../../../StoreTest';
import { seedCharacter, seedCharacterData } from "../../../__seeds__/seedCharacter";
import { Character } from './Character';

describe('# Character', () => {

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('should be alive with life more than 0', () => {

        const character = seedCharacter({
            features: {
                life: 1
            }
        });

        expect(character.isAlive).toBe(true);
    });

    it('should not be alive with life to 0', () => {

        const character = seedCharacter({
            features: {
                life: 0
            }
        });

        expect(character.isAlive).toBe(false);
    });

    it('should update props correctly with set()', () => {
        const character = seedCharacter();

        character.set({
            orientation: 'right',
            position: { x: 67, y: 27 },
            state: 'move'
        });

        expect(character).toMatchObject<Partial<Character>>({
            orientation: 'right',
            position: { x: 67, y: 27 },
            state: 'move'
        });
    });

    it('should correctly check if spell exists', () => {
        const character = seedCharacter();

        expect(character.hasSpell('move')).toBe(true);
    });

    it('should return correct snapshot', () => {


        const staticData: StaticCharacter = {
            id: '1',
            name: 'name',
            type: 'sampleChar1',
            initialFeatures: {
                life: 100,
                actionTime: 2000
            },
            staticSpells: [ {
                id: '2',
                name: 'toto',
                color: '#F00',
                type: 'move',
                initialFeatures: {
                    duration: 100,
                    area: 1,
                    attack: -1
                }
            } ],
            defaultSpellId: '2'
        };

        const features: CharacterFeatures = {
            life: 80,
            actionTime: 1500
        };

        const orientation: Orientation = 'bottom';
        const position: Position = { x: 4, y: 3 };

        const spellsSnapshots: SpellSnapshot[] = [ {
            id: '2',
            staticData: {
                id: '2',
                name: 'toto',
                color: '#F00',
                type: 'move',
                initialFeatures: {
                    duration: 100,
                    area: 1,
                    attack: -1
                }
            },
            features: {
                duration: 100,
                area: 1,
                attack: -1
            }
        } ];

        const character = seedCharacter({
            staticData,
            features,
            orientation,
            position,
            spellsSnapshots
        });

        const snapshot = character.getSnapshot();
        expect(snapshot).toMatchObject<Omit<CharacterSnapshot, 'spellsSnapshots'>>({
            id: staticData.id,
            staticData,
            features,
            orientation,
            position,
        });
        expect(snapshot.spellsSnapshots.length).toBe(1);
        expect(snapshot.spellsSnapshots[ 0 ].staticData.id).toBe('2');
    });

    it('should update from snapshot correctly', () => {

        const character = seedCharacter();

        const firstSnapshot = character.getSnapshot();

        const newData = seedCharacterData({
            orientation: 'right',
            position: {
                x: 42,
                y: 64
            },
            features: {
                actionTime: 1254,
                life: 784
            },

        });

        character.updateFromSnapshot({
            id: character.id,
            ...newData
        });

        const secondSnapshot = character.getSnapshot();

        expect(secondSnapshot).not.toMatchObject(firstSnapshot);
        expect(secondSnapshot).toMatchObject<Partial<CharacterSnapshot>>({
            orientation: newData.orientation,
            position: newData.position,
            features: newData.features
        });
    });

});
