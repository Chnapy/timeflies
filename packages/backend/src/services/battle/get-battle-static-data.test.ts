import { createPosition, SerializableState, StaticCharacter, StaticPlayer, StaticSpell } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { BattlePayload, StaticState } from './battle';
import { getBattleStaticData } from './get-battle-static-data';

describe('get battle static data', () => {

    const battlePayload: Pick<BattlePayload, 'staticPlayerList' | 'staticCharacterList' | 'entityListData'> = {
        staticPlayerList: [
            {
                playerId: 'p1',
                playerName: 'p-1',
                ready: true,
                teamColor: '#000',
                type: 'player'
            },
            {
                playerId: 'p2',
                playerName: 'p-2',
                ready: true,
                teamColor: '#FFF',
                type: 'player'
            }
        ],
        staticCharacterList: [
            {
                characterId: 'c1',
                characterRole: 'meti',
                placement: createPosition(1, 1),
                playerId: 'p1'
            },
            {
                characterId: 'c2',
                characterRole: 'tacka',
                placement: createPosition(2, 2),
                playerId: 'p1'
            },
            {
                characterId: 'c3',
                characterRole: 'vemo',
                placement: createPosition(3, 3),
                playerId: 'p2'
            },
        ],
        entityListData: {
            characterList: [
                {
                    characterRole: 'meti',
                    defaultSpellRole: 'move',
                    variables: {
                        health: 100,
                        actionTime: 9000
                    }
                },
                {
                    characterRole: 'tacka',
                    defaultSpellRole: 'move',
                    variables: {
                        health: 90,
                        actionTime: 10000
                    }
                },
                {
                    characterRole: 'vemo',
                    defaultSpellRole: 'switch',
                    variables: {
                        health: 80,
                        actionTime: 8000
                    }
                },
            ],
            spellList: [
                {
                    spellRole: 'move',
                    characterRole: 'meti',
                    variables: {
                        duration: 1000,
                        lineOfSight: true,
                        rangeArea: 6,
                        actionArea: 1
                    }
                },
                {
                    spellRole: 'move',
                    characterRole: 'tacka',
                    variables: {
                        duration: 1000,
                        lineOfSight: true,
                        rangeArea: 7,
                        actionArea: 1
                    }
                },
                {
                    spellRole: 'switch',
                    characterRole: 'vemo',
                    variables: {
                        duration: 1500,
                        lineOfSight: false,
                        rangeArea: 4,
                        actionArea: 1
                    }
                },
                {
                    spellRole: 'simpleAttack',
                    characterRole: 'tacka',
                    variables: {
                        duration: 1200,
                        lineOfSight: true,
                        rangeArea: 5,
                        actionArea: 2,
                        attack: 15
                    }
                }
            ]
        }
    };

    it('gives correct staticPlayers', () => {
        const { staticPlayers } = getBattleStaticData(battlePayload);

        expect(staticPlayers).toEqual<StaticPlayer[]>([
            {
                playerId: 'p1',
                playerName: 'p-1',
                teamColor: '#000',
                type: 'player'
            },
            {
                playerId: 'p2',
                playerName: 'p-2',
                teamColor: '#FFF',
                type: 'player'
            }
        ]);
    });

    it('gives correct staticCharacters', () => {
        const { staticCharacters } = getBattleStaticData(battlePayload);

        expect(staticCharacters).toEqual<StaticCharacter[]>([
            {
                characterId: 'c1',
                characterRole: 'meti',
                defaultSpellId: expect.any(String),
                playerId: 'p1'
            },
            {
                characterId: 'c2',
                characterRole: 'tacka',
                defaultSpellId: expect.any(String),
                playerId: 'p1'
            },
            {
                characterId: 'c3',
                characterRole: 'vemo',
                defaultSpellId: expect.any(String),
                playerId: 'p2'
            }
        ]);
    });

    it('gives correct staticSpells', () => {
        const { staticSpells } = getBattleStaticData(battlePayload);

        expect(staticSpells).toEqual(expect.arrayContaining<StaticSpell>([
            {
                spellId: expect.any(String),
                characterId: 'c1',
                spellRole: 'move'
            },
            {
                spellId: expect.any(String),
                characterId: 'c2',
                spellRole: 'move'
            },
            {
                spellId: expect.any(String),
                characterId: 'c3',
                spellRole: 'switch'
            },
            {
                spellId: expect.any(String),
                characterId: 'c2',
                spellRole: 'simpleAttack'
            }
        ]));
    });

    it('gives correct staticState', () => {
        const { staticState } = getBattleStaticData(battlePayload);

        expect(staticState).toEqual<StaticState>({
            players: {
                'p1': {
                    playerId: 'p1',
                    playerName: 'p-1',
                    teamColor: '#000',
                    type: 'player'
                },
                'p2': {
                    playerId: 'p2',
                    playerName: 'p-2',
                    teamColor: '#FFF',
                    type: 'player'
                }
            },
            characters: {
                'c1': {
                    characterId: 'c1',
                    characterRole: 'meti',
                    defaultSpellId: expect.any(String),
                    playerId: 'p1'
                },
                'c2': {
                    characterId: 'c2',
                    characterRole: 'tacka',
                    defaultSpellId: expect.any(String),
                    playerId: 'p1'
                },
                'c3': {
                    characterId: 'c3',
                    characterRole: 'vemo',
                    defaultSpellId: expect.any(String),
                    playerId: 'p2'
                }
            },
            spells: expect.anything()
        });

        expect(Object.values(staticState.spells)).toEqual(expect.arrayContaining([
            {
                spellId: expect.any(String),
                characterId: 'c1',
                spellRole: 'move'
            },
            {
                spellId: expect.any(String),
                characterId: 'c2',
                spellRole: 'move'
            },
            {
                spellId: expect.any(String),
                characterId: 'c3',
                spellRole: 'switch'
            },
            {
                spellId: expect.any(String),
                characterId: 'c2',
                spellRole: 'simpleAttack'
            }
        ]));
    });

    it('gives correct initialSerializableState', () => {
        const { initialSerializableState } = getBattleStaticData(battlePayload);

        expect(initialSerializableState).toEqual<SerializableState>({
            checksum: expect.any(String),
            time: timerTester.now(),
            characters: {
                health: {
                    'c1': 100,
                    'c2': 90,
                    'c3': 80
                },
                actionTime: {
                    'c1': 9000,
                    'c2': 10000,
                    'c3': 8000
                },
                position: {
                    'c1': createPosition(1, 1),
                    'c2': createPosition(2, 2),
                    'c3': createPosition(3, 3)
                },
                orientation: {
                    'c1': 'bottom',
                    'c2': 'bottom',
                    'c3': 'bottom'
                }
            },
            spells: {
                duration: expect.any(Object),
                rangeArea: expect.any(Object),
                actionArea: expect.any(Object),
                lineOfSight: expect.any(Object),
                attack: expect.any(Object)
            }
        });

        expect(Object.values(initialSerializableState.spells.duration)).toEqual(expect.arrayContaining([
            1000, 1000, 1500, 1200
        ]));
        expect(Object.values(initialSerializableState.spells.lineOfSight)).toEqual(expect.arrayContaining([
            true, true, false, true
        ]));
        expect(Object.values(initialSerializableState.spells.rangeArea)).toEqual(expect.arrayContaining([
            6, 7, 4, 5
        ]));
        expect(Object.values(initialSerializableState.spells.actionArea)).toEqual(expect.arrayContaining([
            1, 1, 1, 2
        ]));
        expect(Object.values(initialSerializableState.spells.attack)).toEqual(expect.arrayContaining([
            15
        ]));
    });
});
