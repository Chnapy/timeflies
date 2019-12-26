import { CharacterInfos } from '../phaser/entities/Character';
import { TeamInfos } from '../phaser/entities/Team';
import { BattleRoomState } from '../phaser/scenes/BattleScene';

const charJ1Sample1: CharacterInfos = {
    id: 1,
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
    id: 2,
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
    id: 3,
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

const charactersInfos: CharacterInfos[] = [
    charJ1Sample1,
    charJ1Sample2,
    charJ2Sample3
];

const teamsInfos: TeamInfos[] = [
    {
        id: 1,
        color: 0xFF0000,
        name: 'Team RED',
        playersInfos: [
            {
                id: 1,
                itsMe: true,
                name: 'J1',
                charactersInfos: [
                    charJ1Sample1,
                    charJ1Sample2
                ]
            }
        ]
    },
    {
        id: 2,
        color: 0x0000FF,
        name: 'Team BLUE',
        playersInfos: [
            {
                id: 2,
                itsMe: false,
                name: 'J2',
                charactersInfos: [
                    charJ2Sample3
                ]
            }
        ]
    }
];

export const SampleData: BattleRoomState = {
    mapKey: 'sampleMap1',
    characterTypes: [ 'sampleChar1', 'sampleChar2', 'sampleChar3' ],
    battleData: {
        mapInfos: {
            tilemapKey: 'map',
            decorLayerKey: 'view',
            obstaclesLayerKey: 'obstacles'
        },

        teamsInfos 
    }
};
