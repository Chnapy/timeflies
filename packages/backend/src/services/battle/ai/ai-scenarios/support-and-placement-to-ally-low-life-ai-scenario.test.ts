import { createPosition, SerializableState } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { getAITestEntities } from '../ai-scenario-test-utils';
import { supportAndPlacementToAllyLowLifeAIScenario } from './support-and-placement-to-ally-low-life-ai-scenario';

describe('support and placement to ally low life AI scenario', () => {
    it('do not run scenario when no heal spell', async () => {
        const { firstStates, battle, service } = getAITestEntities({
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
            initialStateInfos: {
                characters: {
                    health: { c1: 100, c4: 100, c2: 100 },
                    position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 4) },
                    actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 3 },
                    actionArea: { s2: 0 },
                    lineOfSight: { s2: false },
                    duration: { s2: 1000 },
                    attack: {}
                }

            },
            stateInfos: {
                characters: {
                    health: { c1: 100, c4: 100, c2: 25 },
                    position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 4) },
                    actionTime: { c1: 1000, c4: 2900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 3 },
                    actionArea: { s2: 0 },
                    lineOfSight: { s2: false },
                    duration: { s2: 1000 },
                    attack: {}
                }
            }
        });

        await timerTester.waitTimer(
            service.executeTurn(battle, 'c4', {
                scenarioList: [ supportAndPlacementToAllyLowLifeAIScenario ]
            })
        );

        expect(battle.stateStack).toEqual<SerializableState[]>(firstStates);
    });

    it('run scenario [switch & blood-sharing] when ally is far and low life', async () => {
        const { firstStates, battle, service } = getAITestEntities({
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
                },
                {
                    spellId: 's3',
                    characterId: 'c4',
                    spellRole: 'blood-sharing'
                }
            ],
            initialStateInfos: {
                characters: {
                    health: { c1: 100, c4: 100, c2: 100 },
                    position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 3) },
                    actionTime: { c1: 1000, c4: 3900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 3, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }

            },
            stateInfos: {
                characters: {
                    health: { c1: 100, c4: 100, c2: 25 },
                    position: { c1: createPosition(20, 20), c4: createPosition(3, 3), c2: createPosition(0, 3) },
                    actionTime: { c1: 1000, c4: 3900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 3, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            }
        });

        await timerTester.waitTimer(
            service.executeTurn(battle, 'c4', {
                scenarioList: [ supportAndPlacementToAllyLowLifeAIScenario ]
            })
        );

        expect(battle.stateStack).toEqual<SerializableState[]>([
            ...firstStates,
            {
                checksum: expect.any(String),
                time: 1,
                characters: {
                    health: { c1: 100, c4: 100, c2: 25 },
                    position: { c1: createPosition(20, 20), c4: createPosition(2, 3), c2: createPosition(0, 3) },
                    actionTime: { c1: 1000, c4: 3900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 3, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            },
            {
                checksum: expect.any(String),
                time: 1001,
                characters: {
                    health: { c1: 100, c4: 100, c2: 25 },
                    position: { c1: createPosition(20, 20), c4: createPosition(1, 3), c2: createPosition(0, 3) },
                    actionTime: { c1: 1000, c4: 3900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 3, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            },
            {
                checksum: expect.any(String),
                time: 2001,
                characters: {
                    health: { c1: 100, c4: 100, c2: 45 },
                    position: { c1: createPosition(20, 20), c4: createPosition(1, 3), c2: createPosition(0, 3) },
                    actionTime: { c1: 1000, c4: 3900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 3, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            }
        ]);
    });

    it('run scenario [move & blood-sharing] when ally is far and low life', async () => {
        const { firstStates, battle, service } = getAITestEntities({
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
                },
                {
                    spellId: 's3',
                    characterId: 'c4',
                    spellRole: 'blood-sharing'
                }
            ],
            initialStateInfos: {
                characters: {
                    health: { c1: 100, c4: 100, c2: 100 },
                    position: { c1: createPosition(0, 20), c4: createPosition(3, 3), c2: createPosition(20, 3) },
                    actionTime: { c1: 1000, c4: 7900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 10, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }

            },
            stateInfos: {
                characters: {
                    health: { c1: 100, c4: 100, c2: 25 },
                    position: { c1: createPosition(0, 20), c4: createPosition(3, 3), c2: createPosition(20, 3) },
                    actionTime: { c1: 1000, c4: 7900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'bottom', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 10, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            }
        });

        await timerTester.waitTimer(
            service.executeTurn(battle, 'c4', {
                scenarioList: [ supportAndPlacementToAllyLowLifeAIScenario ]
            })
        );

        expect(battle.stateStack).toEqual<SerializableState[]>([
            ...firstStates,
            {
                checksum: expect.any(String),
                time: 1,
                characters: {
                    health: { c1: 100, c4: 100, c2: 25 },
                    position: { c1: createPosition(0, 20), c4: createPosition(6, 3), c2: createPosition(20, 3) },
                    actionTime: { c1: 1000, c4: 7900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'right', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 10, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            },
            {
                checksum: expect.any(String),
                time: 3001,
                characters: {
                    health: { c1: 100, c4: 100, c2: 25 },
                    position: { c1: createPosition(0, 20), c4: createPosition(9, 3), c2: createPosition(20, 3) },
                    actionTime: { c1: 1000, c4: 7900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'right', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 10, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            },
            {
                checksum: expect.any(String),
                time: 6001,
                characters: {
                    health: { c1: 100, c4: 100, c2: 25 },
                    position: { c1: createPosition(0, 20), c4: createPosition(10, 3), c2: createPosition(20, 3) },
                    actionTime: { c1: 1000, c4: 7900, c2: 1000 },
                    orientation: { c1: 'bottom', c4: 'right', c2: 'bottom' }
                },
                spells: {
                    rangeArea: { s2: 10, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            }
        ]);
    });

    it('go to closest ally low life [switch]', async () => {
        const { firstStates, battle, service } = getAITestEntities({
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
                },
                {
                    spellId: 's3',
                    characterId: 'c4',
                    spellRole: 'blood-sharing'
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
                    rangeArea: { s2: 10, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
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
                    rangeArea: { s2: 10, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            }
        });

        await timerTester.waitTimer(
            service.executeTurn(battle, 'c4', {
                scenarioList: [ supportAndPlacementToAllyLowLifeAIScenario ]
            })
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
                    rangeArea: { s2: 10, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
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
                    rangeArea: { s2: 10, s3: 1 },
                    actionArea: { s2: 0, s3: 0 },
                    lineOfSight: { s2: false, s3: false },
                    duration: { s2: 1000, s3: 1000 },
                    attack: { s3: 20 }
                }
            }
        ]);
    });
});
