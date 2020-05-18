import { CharacterType, StaticCharacter } from '@timeflies/shared';


export const createStaticCharacter = (id: string, type: CharacterType): StaticCharacter => {

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
        name: 'sampleChar 1',
        type: 'sampleChar1',
        initialFeatures: {
            life: 100,
            actionTime: 20000
        },
        staticSpells: [
            {
                id: id + '-1',
                name: 'MOVE',
                type: 'move',
                initialFeatures: {
                    duration: 200,
                    area: 1,
                    attack: -1
                }
            },
            {
                id: id + '-10',
                name: 'S1',
                type: 'simpleAttack',
                initialFeatures: {
                    duration: 1000,
                    area: 10,
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
        name: 'sampleChar 2',
        type: 'sampleChar2',
        initialFeatures: {
            life: 120,
            actionTime: 15000
        },
        staticSpells: [
            {
                id: id + '-2',
                name: 'MOVE',
                type: 'move',
                initialFeatures: {
                    duration: 600,
                    area: 1,
                    attack: -1
                }
            },
            {
                id: id + '-20',
                name: 'Attack',
                type: 'simpleAttack',
                initialFeatures: {
                    duration: 4000,
                    area: 8,
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
        name: 'sampleChar 3',
        type: 'sampleChar3',
        initialFeatures: {
            life: 80,
            actionTime: 22000
        },
        staticSpells: [
            {
                id: id + '-3',
                name: 'MOVE',
                type: 'move',
                initialFeatures: {
                    area: 1,
                    duration: 300,
                    attack: -1
                }
            },
            {
                id: id + '-30',
                name: 'S3',
                type: 'simpleAttack',
                initialFeatures: {
                    area: 8,
                    duration: 500,
                    attack: 10
                }
            }
        ],
        defaultSpellId: id + '-3'
    }
};
