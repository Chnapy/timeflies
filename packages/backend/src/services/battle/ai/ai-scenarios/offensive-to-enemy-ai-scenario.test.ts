import { createPosition, SerializableState } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { getAITestEntities } from '../ai-scenario-test-utils';
import { offensiveToEnemyAIScenario } from './offensive-to-enemy-ai-scenario';

describe('offensive to enemy AI scenario', () => {
    it('run scenario [simpleAttack] when enemy is close', async () => {

        const { firstStates, battle, service } = getAITestEntities({
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
            service.executeTurn(battle, 'c4', {
                scenarioList: [offensiveToEnemyAIScenario]
            })
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
