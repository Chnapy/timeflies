import { StaticCharacter } from "@timeflies/shared";

const MOCK_CHAR: StaticCharacter[] = [
    {
        id: '1',
        role: 'sampleChar1',
        name: 'Ramio',
        initialFeatures: {
            life: 100,
            actionTime: 20000
        },
        staticSpells: [
            {
                id: '1',
                name: 'MOVE',
                role: 'move',
                initialFeatures: {
                    duration: 200,
                    rangeArea: 1,
                    attack: -1
                }
            },
            {
                id: '10',
                name: 'S1',
                role: 'simpleAttack',
                initialFeatures: {
                    duration: 1000,
                    rangeArea: 10,
                    attack: 10
                }
            }
        ],
        defaultSpellId: '1'
    },

    {
        id: '2',
        name: 'Guili',
        role: 'sampleChar1',
        initialFeatures: {
            life: 120,
            actionTime: 15000
        },
        staticSpells: [
            {
                id: '2',
                name: 'MOVE',
                role: 'simpleAttack',
                initialFeatures: {
                    duration: 4000,
                    rangeArea: 8,
                    attack: 30
                }
            }
        ],
        defaultSpellId: '2'
    },

    {
        id: '3',
        name: 'Shoyi',
        role: 'sampleChar1',
        initialFeatures: {
            life: 80,
            actionTime: 22000
        },
        staticSpells: [
            {
                id: '3',
                name: 'MOVE',
                role: 'move',
                initialFeatures: {
                    rangeArea: 1,
                    duration: 300,
                    attack: -1
                }
            },
            {
                id: '20',
                name: 'S3',
                role: 'simpleAttack',
                initialFeatures: {
                    rangeArea: 8,
                    duration: 500,
                    attack: 10
                }
            }
        ],
        defaultSpellId: '3'
    }
];

export const seedStaticCharacter = ({length, filterFn, alterFn}: {
    length?: number;
    filterFn?: (char: StaticCharacter, i: number) => boolean;
    alterFn?: (char: StaticCharacter, i: number) => void;
} = {}): StaticCharacter[] => {
    let copy: StaticCharacter[] = JSON.parse(JSON.stringify(MOCK_CHAR));

    if(filterFn) {
        copy = copy.filter(filterFn);
    }

    if(length !== undefined) {
        copy.splice(length);
    }

    if(alterFn) {
        copy.forEach(alterFn);
    }

    return copy;
};