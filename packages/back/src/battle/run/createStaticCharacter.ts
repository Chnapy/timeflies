import { CharacterRole, StaticCharacter } from '@timeflies/shared';


export const createStaticCharacter = (id: string, type: CharacterRole): StaticCharacter => {

    switch (type) {
        case 'sampleChar1':
            return createSampleChar1(id);
        case 'sampleChar2':
            return createSampleChar2(id);
        case 'sampleChar3':
            return createSampleChar3(id);
    }
};

const createSampleChar1 = (id: string): StaticCharacter => {

    return {
        id,
        role: 'sampleChar1',
        name: 'sampleChar 1',
        description: 'description sampleChar 1',
        initialFeatures: {
            life: 100,
            actionTime: 20000
        },
        staticSpells: [
            {
                id: id + '-1',
                name: 'MOVE',
                role: 'move',
                description: 'description move',
                initialFeatures: {
                    duration: 200,
                    rangeArea: -1,
                    actionArea: 1,
                    attack: -1
                }
            },
            {
                id: id + '-10',
                name: 'S1',
                role: 'simpleAttack',
                description: 'description simpleAttack',
                initialFeatures: {
                    duration: 1000,
                    rangeArea: 10,
                    actionArea: 2,
                    attack: 10
                }
            }
        ],
        defaultSpellId: id + '-1'
    }
};

const createSampleChar2 = (id: string): StaticCharacter => {

    return {
        id,
        role: 'sampleChar2',
        name: 'sampleChar 2',
        description: 'description sampleChar 2',
        initialFeatures: {
            life: 120,
            actionTime: 15000
        },
        staticSpells: [
            {
                id: id + '-2',
                name: 'MOVE',
                role: 'move',
                description: 'description move',
                initialFeatures: {
                    duration: 600,
                    rangeArea: -1,
                    actionArea: 1,
                    attack: -1
                }
            },
            {
                id: id + '-20',
                name: 'Attack',
                role: 'simpleAttack',
                description: 'description simpleAttack',
                initialFeatures: {
                    duration: 4000,
                    rangeArea: 8,
                    actionArea: 2,
                    attack: 30
                }
            }
        ],
        defaultSpellId: id + '-2'
    }
};

const createSampleChar3 = (id: string): StaticCharacter => {

    return {
        id,
        role: 'sampleChar3',
        name: 'sampleChar 3',
        description: 'description sampleChar 3',
        initialFeatures: {
            life: 80,
            actionTime: 22000
        },
        staticSpells: [
            {
                id: id + '-3',
                name: 'MOVE',
                role: 'move',
                description: 'description move',
                initialFeatures: {
                    rangeArea: -1,
                    actionArea: 1,
                    duration: 300,
                    attack: -1
                }
            },
            {
                id: id + '-30',
                name: 'S3',
                role: 'simpleAttack',
                description: 'description simpleAttack',
                initialFeatures: {
                    rangeArea: 8,
                    actionArea: 3,
                    duration: 500,
                    attack: 10
                }
            }
        ],
        defaultSpellId: id + '-3'
    }
};
