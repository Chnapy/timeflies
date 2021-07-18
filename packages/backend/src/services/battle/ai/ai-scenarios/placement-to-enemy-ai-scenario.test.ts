import { createPosition, SerializableState } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { getAITestEntities } from '../ai-scenario-test-utils';
import { placementToEnemyAIScenario } from './placement-to-enemy-ai-scenario';

describe('placement to enemy AI scenario', () => {
    it('run scenario [switch] when enemy is far', async () => {

        const { firstStates, battle, service } = getAITestEntities({
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
            service.executeTurn(battle, 'c4', {
                scenarioList: [ placementToEnemyAIScenario ]
            })
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

        const { firstStates, battle, service } = getAITestEntities({
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
            service.executeTurn(battle, 'c4', {
                scenarioList: [ placementToEnemyAIScenario ]
            })
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

        const { firstStates, battle, service } = getAITestEntities({
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
            service.executeTurn(battle, 'c4', {
                scenarioList: [ placementToEnemyAIScenario ]
            })
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
