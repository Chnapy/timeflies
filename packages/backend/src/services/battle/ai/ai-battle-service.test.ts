import { createPosition, SerializableState } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { BattleNotifyMessage } from '@timeflies/socket-messages';
import { createFakeSocketCell } from '../../service-test-utils';
import { getAITestEntities } from './ai-scenario-test-utils';
import { offensiveToEnemyAIScenario } from './ai-scenarios/offensive-to-enemy-ai-scenario';
import { placementToEnemyAIScenario } from './ai-scenarios/placement-to-enemy-ai-scenario';

describe('ai battle service', () => {

    it('send every notify messages at once', async () => {

        const { battle, service } = getAITestEntities({
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
            service.executeTurn(battle, 'c4', {
                scenarioList: [ offensiveToEnemyAIScenario ]
            })
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

    it('run placement to enemy scenario [move] then offensive to enemy scenario [simpleAttack] when enemy is close', async () => {

        const { firstStates, battle, service } = getAITestEntities({
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
            service.executeTurn(battle, 'c4', {
                scenarioList: [
                    offensiveToEnemyAIScenario,
                    placementToEnemyAIScenario
                ]
            })
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
