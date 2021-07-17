import { createPosition, normalize, SerializableState } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { BattleNotifyMessage } from '@timeflies/socket-messages';
import { computeChecksum } from '@timeflies/spell-effects';
import TiledMap from 'tiled-types/types';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../../service-test-utils';
import { createServices } from '../../services';
import { Battle } from '../battle';
import { createFakeBattle } from '../battle-service-test-utils';
import { AIBattleService } from './ai-battle-service';

describe('ai battle service', () => {

    type BattleProps = {
        staticSpells: Battle[ 'staticSpells' ];
        stateInfos: Pick<SerializableState, 'characters' | 'spells'>;
        initialStateInfos?: Pick<SerializableState, 'characters' | 'spells'>;
        extraCharacters?: Battle[ 'staticCharacters' ];
        tiledMap?: Partial<TiledMap>;
    };

    const getEntities = ({ staticSpells, stateInfos, initialStateInfos = stateInfos, extraCharacters = [], tiledMap }: BattleProps) => {

        const staticEntities: Pick<Battle, 'staticPlayers' | 'staticCharacters' | 'staticSpells'> = {
            staticPlayers: [
                {
                    playerId: 'p1',
                    playerName: 'p-1',
                    teamColor: '#FF0000',
                    type: 'player'
                },
                {
                    playerId: 'p2',
                    playerName: 'p-2',
                    teamColor: '#00FF00',
                    type: 'player'
                },
                {
                    playerId: 'ai1',
                    playerName: 'ai-1',
                    teamColor: '#00FF00',
                    type: 'ai'
                }
            ],
            staticCharacters: [
                {
                    characterId: 'c1',
                    playerId: 'p1',
                    characterRole: 'meti',
                    defaultSpellId: 's1'
                },
                {
                    characterId: 'c4',
                    playerId: 'ai1',
                    characterRole: 'tacka',
                    defaultSpellId: 's2'
                },
                ...extraCharacters
            ],
            staticSpells
        };

        const firstStates = [
            initialStateInfos,
            stateInfos
        ].map(infos => {
            const state: SerializableState = {
                checksum: '',
                time: 0,
                ...infos
            };
            state.checksum = computeChecksum(state);
            return state;
        });

        const battle: Battle = {
            ...createFakeBattle(),
            ...staticEntities,
            staticState: {
                players: normalize(staticEntities.staticPlayers, 'playerId'),
                characters: normalize(staticEntities.staticCharacters, 'characterId'),
                spells: normalize(staticEntities.staticSpells, 'spellId')
            },
            stateStack: [ ...firstStates ],
            tiledMap: {
                width: 21,
                height: 21,
                layers: [ {
                    name: 'obstacles',
                    data: []
                } ],
                ...tiledMap
            } as any,
            currentTurnInfos: {
                characterId: 'c4',
                startTime: 1
            }
        };

        const globalEntities = createFakeGlobalEntitiesNoService(undefined, battle);
        const service = new AIBattleService(globalEntities);
        service.services = createServices(globalEntities);
        service.services.aiBattleService = service;

        return { firstStates, battle, globalEntities, service };
    };

    describe('offensive to enemy low life AI scenario', () => {
        it('run scenario [simpleAttack] when enemy is close', async () => {

            const { firstStates, battle, service } = getEntities({
                extraCharacters: [
                    {
                        characterId: 'c2',
                        characterRole: 'tacka',
                        defaultSpellId: '',
                        playerId: 'p1'
                    }
                ],
                staticSpells: [
                    {
                        spellId: 's2',
                        characterId: 'c4',
                        spellRole: 'simpleAttack'
                    }
                ],
                initialStateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 100 },
                        position: { c1: createPosition(2, 3), c4: createPosition(3, 3), c2: createPosition(10, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 2000 },
                        attack: { s2: 20 }
                    }
                },
                stateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 32 },
                        position: { c1: createPosition(2, 3), c4: createPosition(3, 3), c2: createPosition(10, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 2000 },
                        attack: { s2: 20 }
                    }
                }
            });

            await timerTester.waitTimer(
                service.executeTurn(battle, 'c4')
            );

            expect(battle.stateStack).toEqual<SerializableState[]>([
                ...firstStates,
                {
                    checksum: expect.any(String),
                    time: 1,
                    characters: {
                        health: { c1: 100, c4: 100, c2: 12 },
                        position: { c1: createPosition(2, 3), c4: createPosition(3, 3), c2: createPosition(10, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'right', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 2000 },
                        attack: { s2: 20 }
                    }
                }
            ]);
        });
    });

    describe('support ally once AI scenario', () => {
        it('run scenario [motivation] when ally is close', async () => {

            const { firstStates, battle, service } = getEntities({
                extraCharacters: [
                    {
                        characterId: 'c2',
                        characterRole: 'tacka',
                        defaultSpellId: '',
                        playerId: 'p2'
                    }
                ],
                staticSpells: [
                    {
                        spellId: 's2',
                        characterId: 'c4',
                        spellRole: 'motivation'
                    }
                ],
                stateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 100 },
                        position: { c1: createPosition(0, 0), c4: createPosition(3, 3), c2: createPosition(6, 6) },
                        actionTime: { c1: 1000, c4: 4900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 2000 },
                        attack: { s2: 20 }
                    }
                }
            });

            await timerTester.waitTimer(
                service.executeTurn(battle, 'c4')
            );

            expect(battle.stateStack).toEqual<SerializableState[]>([
                ...firstStates,
                {
                    checksum: expect.any(String),
                    time: 1,
                    characters: {
                        health: { c1: 100, c4: 100, c2: 100 },
                        position: { c1: createPosition(0, 0), c4: createPosition(3, 3), c2: createPosition(6, 6) },
                        actionTime: { c1: 1000, c4: 4900, c2: 1300 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 2000 },
                        attack: { s2: 20 }
                    }
                }
            ]);
        });
    });

    describe('placement to ally low life AI scenario', () => {
        it('run scenario [switch] when ally is far and low life', async () => {
            const { firstStates, battle, service } = getEntities({
                extraCharacters: [
                    {
                        characterId: 'c2',
                        characterRole: 'tacka',
                        defaultSpellId: '',
                        playerId: 'p2'
                    }
                ],
                staticSpells: [
                    {
                        spellId: 's2',
                        characterId: 'c4',
                        spellRole: 'switch'
                    }
                ],
                initialStateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }

                },
                stateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 25 },
                        position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            });

            await timerTester.waitTimer(
                service.executeTurn(battle, 'c4')
            );

            expect(battle.stateStack).toEqual<SerializableState[]>([
                ...firstStates,
                {
                    checksum: expect.any(String),
                    time: 1,
                    characters: {
                        health: { c1: 100, c4: 100, c2: 25 },
                        position: { c1: createPosition(20, 20), c4: createPosition(2, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                },
                {
                    checksum: expect.any(String),
                    time: 1001,
                    characters: {
                        health: { c1: 100, c4: 100, c2: 25 },
                        position: { c1: createPosition(20, 20), c4: createPosition(1, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            ]);
        });

        it('run scenario [move] when ally is far and low life', async () => {
            const { firstStates, battle, service } = getEntities({
                extraCharacters: [
                    {
                        characterId: 'c2',
                        characterRole: 'tacka',
                        defaultSpellId: '',
                        playerId: 'p2'
                    }
                ],
                staticSpells: [
                    {
                        spellId: 's2',
                        characterId: 'c4',
                        spellRole: 'move'
                    }
                ],
                initialStateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }

                },
                stateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 25 },
                        position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            });

            await timerTester.waitTimer(
                service.executeTurn(battle, 'c4')
            );

            expect(battle.stateStack).toEqual<SerializableState[]>([
                ...firstStates,
                {
                    checksum: expect.any(String),
                    time: 1,
                    characters: {
                        health: { c1: 100, c4: 100, c2: 25 },
                        position: { c1: createPosition(20, 20), c4: createPosition(1, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'left', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            ]);
        });

        it('go to closest ally low life [switch]', async () => {
            const { firstStates, battle, service } = getEntities({
                extraCharacters: [
                    {
                        characterId: 'c2',
                        characterRole: 'tacka',
                        defaultSpellId: '',
                        playerId: 'p2'
                    },
                    {
                        characterId: 'c3',
                        characterRole: 'tacka',
                        defaultSpellId: '',
                        playerId: 'p2'
                    }
                ],
                staticSpells: [
                    {
                        spellId: 's2',
                        characterId: 'c4',
                        spellRole: 'switch'
                    }
                ],
                initialStateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 100, c3: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 3), c3: createPosition(7, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000, c3: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom', c3: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }

                },
                stateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 25, c3: 25 },
                        position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 3), c3: createPosition(7, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000, c3: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom', c3: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            });

            await timerTester.waitTimer(
                service.executeTurn(battle, 'c4')
            );

            expect(battle.stateStack).toEqual<SerializableState[]>([
                ...firstStates,
                {
                    checksum: expect.any(String),
                    time: 1,
                    characters: {
                        health: { c1: 100, c4: 100, c2: 25, c3: 25 },
                        position: { c1: createPosition(20, 20), c4: createPosition(2, 3), c2: createPosition(0, 3), c3: createPosition(7, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000, c3: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom', c3: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                },
                {
                    checksum: expect.any(String),
                    time: 1001,
                    characters: {
                        health: { c1: 100, c4: 100, c2: 25, c3: 25 },
                        position: { c1: createPosition(20, 20), c4: createPosition(1, 3), c2: createPosition(0, 3), c3: createPosition(7, 3) },
                        actionTime: { c1: 1000, c4: 2900, c2: 1000, c3: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom', c3: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            ]);
        });
    });

    describe('offensive to enemy AI scenario', () => {
        it('run scenario [simpleAttack] when enemy is close', async () => {

            const { firstStates, battle, service } = getEntities({
                staticSpells: [
                    {
                        spellId: 's2',
                        characterId: 'c4',
                        spellRole: 'simpleAttack'
                    }
                ],
                stateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100 },
                        position: { c1: createPosition(0, 0), c4: createPosition(3, 3) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 2000 },
                        attack: { s2: 20 }
                    }
                }
            });

            await timerTester.waitTimer(
                service.executeTurn(battle, 'c4')
            );

            expect(battle.stateStack).toEqual<SerializableState[]>([
                ...firstStates,
                {
                    checksum: expect.any(String),
                    time: 1,
                    characters: {
                        health: { c1: 80, c4: 100 },
                        position: { c1: createPosition(0, 0), c4: createPosition(3, 3) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'top' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 2000 },
                        attack: { s2: 20 }
                    }
                },
                {
                    checksum: expect.any(String),
                    time: 2001,
                    characters: {
                        health: { c1: 60, c4: 100 },
                        position: { c1: createPosition(0, 0), c4: createPosition(3, 3) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'top' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 2000 },
                        attack: { s2: 20 }
                    }
                }
            ]);
        });
    });

    describe('placement to enemy AI scenario', () => {
        it('run scenario [switch] when enemy is far', async () => {

            const { firstStates, battle, service } = getEntities({
                staticSpells: [
                    {
                        spellId: 's2',
                        characterId: 'c4',
                        spellRole: 'switch'
                    }
                ],
                stateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(3, 3) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            });

            await timerTester.waitTimer(
                service.executeTurn(battle, 'c4')
            );

            expect(battle.stateStack).toEqual<SerializableState[]>([
                ...firstStates,
                {
                    checksum: expect.any(String),
                    time: 1,
                    characters: {
                        health: { c1: 100, c4: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(4, 4) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                },
                {
                    checksum: expect.any(String),
                    time: 1001,
                    characters: {
                        health: { c1: 100, c4: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(5, 5) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                },
                {
                    checksum: expect.any(String),
                    time: 2001,
                    characters: {
                        health: { c1: 100, c4: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(6, 6) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                },
                {
                    checksum: expect.any(String),
                    time: 3001,
                    characters: {
                        health: { c1: 100, c4: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(7, 7) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            ]);
        });

        it('run scenario [move] when enemy is far', async () => {

            const { firstStates, battle, service } = getEntities({
                staticSpells: [
                    {
                        spellId: 's2',
                        characterId: 'c4',
                        spellRole: 'move'
                    }
                ],
                stateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(3, 3) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            });

            await timerTester.waitTimer(
                service.executeTurn(battle, 'c4')
            );

            expect(battle.stateStack).toEqual<SerializableState[]>([
                ...firstStates,
                {
                    checksum: expect.any(String),
                    time: 1,
                    characters: {
                        health: { c1: 100, c4: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(6, 3) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'right' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                },
                {
                    checksum: expect.any(String),
                    time: 3001,
                    characters: {
                        health: { c1: 100, c4: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(7, 3) },
                        actionTime: { c1: 1000, c4: 4900 },
                        orientation: { c1: 'bottom', c4: 'right' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            ]);
        });

        it('go to closest enemy [switch]', async () => {

            const { firstStates, battle, service } = getEntities({
                extraCharacters: [
                    {
                        characterId: 'c2',
                        playerId: 'p1',
                        characterRole: 'meti',
                        defaultSpellId: 's1'
                    }
                ],
                staticSpells: [
                    {
                        spellId: 's2',
                        characterId: 'c4',
                        spellRole: 'switch'
                    }
                ],
                stateInfos: {
                    characters: {
                        health: { c1: 100, c4: 100, c2: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2100, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            });

            await timerTester.waitTimer(
                service.executeTurn(battle, 'c4')
            );

            expect(battle.stateStack).toEqual<SerializableState[]>([
                ...firstStates,
                {
                    checksum: expect.any(String),
                    time: 1,
                    characters: {
                        health: { c1: 100, c4: 100, c2: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(2, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2100, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                },
                {
                    checksum: expect.any(String),
                    time: 1001,
                    characters: {
                        health: { c1: 100, c4: 100, c2: 100 },
                        position: { c1: createPosition(20, 20), c4: createPosition(1, 3), c2: createPosition(0, 3) },
                        actionTime: { c1: 1000, c4: 2100, c2: 1000 },
                        orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                    },
                    spells: {
                        rangeArea: { s2: 10 },
                        actionArea: { s2: 0 },
                        lineOfSight: { s2: false },
                        duration: { s2: 1000 },
                        attack: {}
                    }
                }
            ]);
        });
    });

    it('send every notify messages at once', async () => {

        const { battle, service } = getEntities({
            staticSpells: [
                {
                    spellId: 's2',
                    characterId: 'c4',
                    spellRole: 'simpleAttack'
                }
            ],
            stateInfos: {
                characters: {
                    health: { c1: 100, c4: 100 },
                    position: { c1: createPosition(0, 0), c4: createPosition(3, 3) },
                    actionTime: { c1: 1000, c4: 4900 },
                    orientation: { c1: 'bottom', c4: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 10 },
                    actionArea: { s2: 0 },
                    lineOfSight: { s2: false },
                    duration: { s2: 2000 },
                    attack: { s2: 20 }
                }
            }
        });

        const socketCell = createFakeSocketCell();
        service.onSocketConnect(socketCell, 'p1');

        await timerTester.waitTimer(
            service.executeTurn(battle, 'c4')
        );

        expect(socketCell.send).toHaveBeenCalledWith<ReturnType<typeof BattleNotifyMessage>[]>(
            BattleNotifyMessage({
                spellAction: {
                    checksum: expect.any(String),
                    duration: 2000,
                    launchTime: 1,
                    spellId: 's2',
                    targetPos: createPosition(0, 0)
                },
                spellEffect: {
                    actionArea: expect.any(Array),
                    duration: 2000,
                    characters: {
                        c1: {
                            health: -20
                        },
                        c4: {
                            orientation: 'top'
                        }
                    }
                }
            }),
            BattleNotifyMessage({
                spellAction: {
                    checksum: expect.any(String),
                    duration: 2000,
                    launchTime: 2001,
                    spellId: 's2',
                    targetPos: createPosition(0, 0)
                },
                spellEffect: {
                    actionArea: expect.any(Array),
                    duration: 2000,
                    characters: {
                        c1: {
                            health: -20
                        },
                        c4: {
                            orientation: 'top'
                        }
                    }
                }
            })
        );
    });

    it('run placement to enemy scenario [move] then offensive basic scenario [simpleAttack] when enemy is close', async () => {

        const { firstStates, battle, service } = getEntities({
            staticSpells: [
                {
                    spellId: 's2',
                    characterId: 'c4',
                    spellRole: 'move'
                },
                {
                    spellId: 's3',
                    characterId: 'c4',
                    spellRole: 'simpleAttack'
                }
            ],
            stateInfos: {
                characters: {
                    health: { c1: 100, c4: 100 },
                    position: { c1: createPosition(8, 3), c4: createPosition(3, 3) },
                    actionTime: { c1: 1000, c4: 5900 },
                    orientation: { c1: 'bottom', c4: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 10, s3: 3 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 10 }
                }
            }
        });

        await timerTester.waitTimer(
            service.executeTurn(battle, 'c4')
        );

        expect(battle.stateStack).toEqual<SerializableState[]>([
            ...firstStates,
            {
                checksum: expect.any(String),
                time: 1,
                characters: {
                    health: { c1: 100, c4: 100 },
                    position: { c1: createPosition(8, 3), c4: createPosition(6, 3) },
                    actionTime: { c1: 1000, c4: 5900 },
                    orientation: { c1: 'bottom', c4: 'right' }
                },
                spells: {
                    rangeArea: { s2: 10, s3: 3 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 10 }
                }
            },
            {
                checksum: expect.any(String),
                time: 3001,
                characters: {
                    health: { c1: 90, c4: 100 },
                    position: { c1: createPosition(8, 3), c4: createPosition(6, 3) },
                    actionTime: { c1: 1000, c4: 5900 },
                    orientation: { c1: 'bottom', c4: 'right' }
                },
                spells: {
                    rangeArea: { s2: 10, s3: 3 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 10 }
                }
            },
            {
                checksum: expect.any(String),
                time: 4001,
                characters: {
                    health: { c1: 80, c4: 100 },
                    position: { c1: createPosition(8, 3), c4: createPosition(6, 3) },
                    actionTime: { c1: 1000, c4: 5900 },
                    orientation: { c1: 'bottom', c4: 'right' }
                },
                spells: {
                    rangeArea: { s2: 10, s3: 3 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 10 }
                }
            }
        ]);
    });
});
