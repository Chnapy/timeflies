import { CharacterFeatures, Orientation, Position, SpellSnapshot, StaticCharacter } from '@timeflies/shared';
import { Character } from '../stages/battle/entities/Character';
import { Player } from '../stages/battle/entities/Player';
// jest.mock('../phaser/entities/CharacterGraphic');

interface CharacterData {
    staticData: StaticCharacter;
    features: CharacterFeatures;
    orientation: Orientation;
    position: Position;
    spellsSnapshots: SpellSnapshot[];
    player: Player;
}

export const seedCharacterData = (
    {
        staticData: _staticData,
        features: _features,
        orientation: _orientation,
        position: _position,
        spellsSnapshots: _spellsSnapshots,
        player: _player
    }: Partial<{ [K in keyof CharacterData]: Partial<CharacterData[K]> }> = {}
): CharacterData => {

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
        defaultSpellId: '2',
        ...(_staticData ?? {})
    };

    const features: CharacterFeatures = {
        ...staticData.initialFeatures,
        ...(_features ?? {})
    };

    const orientation: Orientation = _orientation ?? 'bottom';
    const position: Position = { x: 4, y: 3, ...(_position ?? {}) };

    const spellsSnapshots: SpellSnapshot[] = (_spellsSnapshots as any) ?? [{
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

    const player: Omit<Player, 'updateFromSnapshot' | 'getSnapshot'> = {
        id: '1',
        name: 'p-name',
        state: 'battle-run',
        team: null as any,
        characters: [],
        itsMe: true,
        ...(_player ?? {})
    };

    return {
        staticData,
        features,
        orientation,
        position,
        spellsSnapshots,
        player: player as Player
    };
};

export const seedCharacter = (data: Parameters<typeof seedCharacterData>[0] = {}) => {

    const {
        player,
        ...rest
    } = seedCharacterData(data);

    return Character(
        rest,
        player
    );
};

// TODO shared
// const MOCK_CHAR: StaticCharacter[] = [
//     {
//         id: '1',
//         type: 'sampleChar1',
//         name: 'Ramio',
//         initialFeatures: {
//             life: 100,
//             actionTime: 6000
//         },
//         staticSpells: [
//             {
//                 id: '1',
//                 name: 'MOVE',
//                 type: 'move',
//                 color: '#FF0000',
//                 initialFeatures: {
//                     duration: 200,
//                     area: 1,
//                     attack: -1
//                 }
//             },
//             {
//                 id: '10',
//                 name: 'S1',
//                 type: 'sampleSpell1',
//                 color: '#FF00FF',
//                 initialFeatures: {
//                     duration: 1000,
//                     area: 30,
//                     attack: 10
//                 }
//             },
//             {
//                 id: '11',
//                 name: 'S2',
//                 type: 'sampleSpell2',
//                 color: '#FFF0FF',
//                 initialFeatures: {
//                     duration: 2000,
//                     area: 1,
//                     attack: 0
//                 }
//             }
//         ],
//         defaultSpellId: '1'
//     },

//     {
//         id: '2',
//         name: 'Guili',
//         type: 'sampleChar2',
//         initialFeatures: {
//             life: 100,
//             actionTime: 7000
//         },
//         staticSpells: [
//             {
//                 id: '2',
//                 name: 'MOVE',
//                 type: 'move',
//                 color: '#FF0000',
//                 initialFeatures: {
//                     duration: 100,
//                     area: 1,
//                     attack: -1
//                 }
//             }
//         ],
//         defaultSpellId: '2'
//     },

//     {
//         id: '3',
//         name: 'Shoyi',
//         type: 'sampleChar3',
//         initialFeatures: {
//             life: 100,
//             actionTime: 5000
//         },
//         staticSpells: [
//             {
//                 id: '3',
//                 name: 'MOVE',
//                 type: 'move',
//                 color: '#449955',
//                 initialFeatures: {
//                     area: 1,
//                     duration: 100,
//                     attack: -1
//                 }
//             },
//             {
//                 id: '20',
//                 name: 'S3',
//                 type: 'sampleSpell3',
//                 color: '#22FF88',
//                 initialFeatures: {
//                     area: 8,
//                     duration: 1500,
//                     attack: 15
//                 }
//             }
//         ],
//         defaultSpellId: '3'
//     }
// ];

// const MOCK_SNAPS: CharacterSnapshot[] = MOCK_CHAR.map<CharacterSnapshot>(staticData => ({
//     staticData,
//     position: { x: -1, y: -1 },
//     orientation: 'bottom',
//     features: {
//         life: 100,
//         actionTime: 3000
//     },
//     spellsSnapshots: [] // TODO
// }));

// export const seedSnapshotCharacter = ({ length, filterFn, alterFn }: {
//     length?: number;
//     filterFn?: (char: CharacterSnapshot, i: number) => boolean;
//     alterFn?: (char: CharacterSnapshot, i: number) => void;
// } = {}): CharacterSnapshot[] => {
//     let copy: CharacterSnapshot[] = JSON.parse(JSON.stringify(MOCK_SNAPS));

//     if (filterFn) {
//         copy = copy.filter(filterFn);
//     }

//     if (length !== undefined) {
//         copy.splice(length);
//     }

//     if (alterFn) {
//         copy.forEach(alterFn);
//     }

//     return copy;
// };

// export const seedCharacters = (
//     charArgs: Parameters<typeof seedSnapshotCharacter>[ 0 ],
//     getPlayer: (i: number) => Player,
//     battleScene: BattleScene
// ): Character[] => {
//     const snapshots = seedSnapshotCharacter(charArgs);

//     battleScene = battleScene || new BattleScene();

//     return snapshots.map((s, i) => {
//         const player = getPlayer(i);

//         return new Character(s, player, player.team, battleScene!);
//     });
// };