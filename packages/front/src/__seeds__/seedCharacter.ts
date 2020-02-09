import { CharacterSnapshot, StaticCharacter } from '@timeflies/shared';
import { Character } from '../phaser/entities/Character';
import { Player } from '../phaser/entities/Player';
import { BattleScene } from '../phaser/scenes/BattleScene';
jest.mock('../phaser/entities/CharacterGraphic');

// TODO shared
const MOCK_CHAR: StaticCharacter[] = [
    {
        id: '1',
        type: 'sampleChar1',
        name: 'Ramio',
        initialFeatures: {
            life: 100,
            actionTime: 6000
        },
        staticSpells: [
            {
                id: '1',
                name: 'MOVE',
                type: 'move',
                color: '#FF0000',
                initialFeatures: {
                    duration: 200,
                    area: 1,
                    attack: -1
                }
            },
            {
                id: '10',
                name: 'S1',
                type: 'sampleSpell1',
                color: '#FF00FF',
                initialFeatures: {
                    duration: 1000,
                    area: 30,
                    attack: 10
                }
            },
            {
                id: '11',
                name: 'S2',
                type: 'sampleSpell2',
                color: '#FFF0FF',
                initialFeatures: {
                    duration: 2000,
                    area: 1,
                    attack: 0
                }
            }
        ],
        defaultSpellId: '1'
    },

    {
        id: '2',
        name: 'Guili',
        type: 'sampleChar2',
        initialFeatures: {
            life: 100,
            actionTime: 7000
        },
        staticSpells: [
            {
                id: '2',
                name: 'MOVE',
                type: 'move',
                color: '#FF0000',
                initialFeatures: {
                    duration: 100,
                    area: 1,
                    attack: -1
                }
            }
        ],
        defaultSpellId: '2'
    },

    {
        id: '3',
        name: 'Shoyi',
        type: 'sampleChar3',
        initialFeatures: {
            life: 100,
            actionTime: 5000
        },
        staticSpells: [
            {
                id: '3',
                name: 'MOVE',
                type: 'move',
                color: '#449955',
                initialFeatures: {
                    area: 1,
                    duration: 100,
                    attack: -1
                }
            },
            {
                id: '20',
                name: 'S3',
                type: 'sampleSpell3',
                color: '#22FF88',
                initialFeatures: {
                    area: 8,
                    duration: 1500,
                    attack: 15
                }
            }
        ],
        defaultSpellId: '3'
    }
];

const MOCK_SNAPS: CharacterSnapshot[] = MOCK_CHAR.map<CharacterSnapshot>(staticData => ({
    staticData,
    position: { x: -1, y: -1 },
    orientation: 'bottom',
    features: {
        life: 100,
        actionTime: 3000
    },
    spellsSnapshots: [] // TODO
}));

export const seedSnapshotCharacter = ({ length, filterFn, alterFn }: {
    length?: number;
    filterFn?: (char: CharacterSnapshot, i: number) => boolean;
    alterFn?: (char: CharacterSnapshot, i: number) => void;
} = {}): CharacterSnapshot[] => {
    let copy: CharacterSnapshot[] = JSON.parse(JSON.stringify(MOCK_SNAPS));

    if (filterFn) {
        copy = copy.filter(filterFn);
    }

    if (length !== undefined) {
        copy.splice(length);
    }

    if (alterFn) {
        copy.forEach(alterFn);
    }

    return copy;
};

export const seedCharacters = (
    charArgs: Parameters<typeof seedSnapshotCharacter>[ 0 ],
    getPlayer: (i: number) => Player,
    battleScene: BattleScene
): Character[] => {
    const snapshots = seedSnapshotCharacter(charArgs);

    battleScene = battleScene || new BattleScene();

    return snapshots.map((s, i) => {
        const player = getPlayer(i);

        return new Character(s, player, player.team, battleScene!);
    });
};