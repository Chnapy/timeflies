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
        extraCharacters?: Battle[ 'staticCharacters' ];
        tiledMap?: Partial<TiledMap>;
    };

    const getEntities = ({ staticSpells, stateInfos, extraCharacters = [], tiledMap }: BattleProps) => {

        const staticEntities: Pick<Battle, 'staticPlayers' | 'staticCharacters' | 'staticSpells'> = {
            staticPlayers: [
                {
                    playerId: 'p1',
                    playerName: 'p-1',
                    teamColor: '#FF0000',
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

        const firstState: SerializableState = {
            checksum: '',
            time: 0,
            ...stateInfos
        };
        firstState.checksum = computeChecksum(firstState);

        const battle: Battle = {
            ...createFakeBattle(),
            ...staticEntities,
            staticState: {
                players: normalize(staticEntities.staticPlayers, 'playerId'),
                characters: normalize(staticEntities.staticCharacters, 'characterId'),
                spells: normalize(staticEntities.staticSpells, 'spellId')
            },
            stateStack: [ firstState ],
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

        return { firstState, battle, globalEntities, service };
    };

    it('run offensive scenario [simpleAttack] when enemy is close', async () => {

        const { firstState, battle, service } = getEntities({
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
            firstState,
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

    describe('placement scenario', () => {
        it('run placement scenario [switch] when enemy is far', async () => {

            const { firstState, battle, service } = getEntities({
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
                firstState,
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

        it('run placement scenario [move] when enemy is far', async () => {

            const { firstState, battle, service } = getEntities({
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
                firstState,
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

            const { firstState, battle, service } = getEntities({
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
                firstState,
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

    it('run placement scenario [move] then offensive scenario [simpleAttack] when enemy is close', async () => {

        const { firstState, battle, service } = getEntities({
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
            firstState,
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
