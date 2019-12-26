import { LoadSceneData } from './LoadScene';
import { PlayerInfos } from '../entities/Player';
import { CharacterInfos } from '../entities/Character';

const charJ1Sample1: CharacterInfos = {
    isMine: true,
    name: 'C1',
    type: 'sampleChar1',
    position: {
        x: 4,
        y: 3
    },
    life: 100,
    actionTime: 9000,
    sortsInfos: [
        {
            name: 'S1',
            type: 'sampleSort1',
            zone: 30,
            time: 1000,
            attaque: 10
        },
        {
            name: 'S2',
            type: 'sampleSort2',
            zone: 1,
            time: 2000,
            attaque: 0
        }
    ]
};

const charJ1Sample2: CharacterInfos = {
    isMine: true,
    name: 'C2',
    type: 'sampleChar2',
    position: {
        x: 6,
        y: 3
    },
    life: 100,
    actionTime: 7000,
    sortsInfos: []
};

const charJ2Sample3: CharacterInfos = {
    isMine: false,
    name: 'C3',
    type: 'sampleChar3',
    position: {
        x: 6,
        y: 4
    },
    life: 100,
    actionTime: 5000,
    sortsInfos: [
        {
            name: 'S3',
            type: 'sampleSort3',
            zone: 8,
            time: 1500,
            attaque: 15
        }
    ]
};

const playersInfos: PlayerInfos[] = [
    {
        itsMe: true,
        name: 'J1',
        charactersInfos: [
            charJ1Sample1,
            charJ1Sample2
        ]
    },
    {
        itsMe: false,
        name: 'J2',
        charactersInfos: [
            charJ2Sample3
        ]
    }
];

export const SampleData: LoadSceneData = {
    mapKey: 'sampleMap1',
    characterTypes: ['sampleChar1', 'sampleChar2', 'sampleChar3'],
    battleData: {
        mapInfos: {
            tilemapKey: 'map',
            decorLayerKey: 'view',
            obstaclesLayerKey: 'obstacles'
        },

        playersInfos
    }
};
