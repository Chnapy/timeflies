import { CharacterFeatures, CharacterSnapshot, Orientation, Position, SpellSnapshot, StaticCharacter } from "@timeflies/shared";
import { Character } from "./Character";
import { seedCharacter, seedCharacterData } from "../../../__seeds__/seedCharacter";

describe('# Character', () => {

    let character: Character;

    it('should return correct snapshot', () => {


        const staticData: StaticCharacter = {
            id: '1',
            name: 'name',
            type: 'sampleChar1',
            initialFeatures: {
                life: 100,
                actionTime: 2000
            },
            staticSpells: [{
                id: '2',
                name: 'toto',
                color: '#F00',
                type: 'move',
                initialFeatures: {
                    duration: 100,
                    area: 1,
                    attack: -1
                }
            }],
            defaultSpellId: '2'
        };

        const features: CharacterFeatures = {
            life: 80,
            actionTime: 1500
        };

        const orientation: Orientation = 'bottom';
        const position: Position = { x: 4, y: 3 };

        const spellsSnapshots: SpellSnapshot[] = [{
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
        }];

        character = seedCharacter({
            staticData,
            features,
            orientation,
            position,
            spellsSnapshots
        });

        const snapshot = character.getSnapshot();
        expect(snapshot).toMatchObject<Omit<CharacterSnapshot, 'spellsSnapshots'>>({
            staticData,
            features,
            orientation,
            position,
        });
        expect(snapshot.spellsSnapshots.length).toBe(1);
        expect(snapshot.spellsSnapshots[0].staticData.id).toBe('2');
    });

    it('should update from snapshot correctly', () => {

        character = seedCharacter();

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
