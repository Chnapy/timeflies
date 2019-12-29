import { CharacterSnapshot } from '../phaser/entities/Character';
import { TeamSnapshot } from '../phaser/entities/Team';
import { BattleRoomState } from '../phaser/scenes/BattleScene';

const charJ1Sample1: CharacterSnapshot = {
    id: 1,
    isMine: true,
    name: 'C1',
    type: 'sampleChar1',
    position: {
        x: 4,
        y: 3
    },
    orientation: 'bottom',
    state: 'idle',
    life: 100,
    actionTime: 9000,
    spellsSnapshots: [
        {
            id: 1,
            name: 'S1',
            type: 'sampleSpell1',
            zone: 30,
            time: 1000,
            attaque: 10
        },
        {
            id: 2,
            name: 'S2',
            type: 'sampleSpell2',
            zone: 1,
            time: 2000,
            attaque: 0
        },
        {
            id: 4,
            name: 'MOVE',
            type: 'move',
            zone: -1,
            time: 200,
            attaque: -1
        }
    ]
};

const charJ1Sample2: CharacterSnapshot = {
    id: 2,
    isMine: true,
    name: 'C2',
    type: 'sampleChar2',
    position: {
        x: 10,
        y: 3
    },
    orientation: 'right',
    state: 'idle',
    life: 100,
    actionTime: 7000,
    spellsSnapshots: [
        {
            id: 5,
            name: 'MOVE',
            type: 'move',
            zone: -1,
            time: 100,
            attaque: -1
        }
    ]
};

const charJ2Sample3: CharacterSnapshot = {
    id: 3,
    isMine: false,
    name: 'C3',
    type: 'sampleChar3',
    position: {
        x: 6,
        y: 4
    },
    orientation: 'left',
    state: 'idle',
    life: 100,
    actionTime: 5000,
    spellsSnapshots: [
        {
            id: 3,
            name: 'S3',
            type: 'sampleSpell3',
            zone: 8,
            time: 1500,
            attaque: 15
        },
        {
            id: 6,
            name: 'MOVE',
            type: 'move',
            zone: -1,
            time: 100,
            attaque: -1
        }
    ]
};

const charactersSnapshots: CharacterSnapshot[] = [
    charJ1Sample1,
    charJ1Sample2,
    charJ2Sample3
];

const teamsSnapshots: TeamSnapshot[] = [
    {
        id: 1,
        color: 0xFF0000,
        name: 'Team RED',
        playersSnapshots: [
            {
                id: 1,
                itsMe: true,
                name: 'J1',
                charactersSnapshots: [
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
        playersSnapshots: [
            {
                id: 2,
                itsMe: false,
                name: 'J2',
                charactersSnapshots: [
                    charJ2Sample3
                ]
            }
        ]
    }
];

export const SampleData: BattleRoomState = {
    mapInfos: {
        mapKey: 'sampleMap1',
        tilemapKey: 'map_main',
        decorLayerKey: 'decors',
        obstaclesLayerKey: 'obstacles'
    },
    characterTypes: [ 'sampleChar1', 'sampleChar2', 'sampleChar3' ],
    spellTypes: [
        'move',
        'orientate',
        'sampleSpell1',
        'sampleSpell2',
        'sampleSpell3'
    ],
    battleSnapshot: {

        teamsSnapshots
    }
};
