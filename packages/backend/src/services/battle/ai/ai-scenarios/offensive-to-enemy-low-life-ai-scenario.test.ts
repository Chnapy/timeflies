import { createPosition, SerializableState } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { getAITestEntities } from '../ai-scenario-test-utils';
import { offensiveToEnemyLowLifeAIScenario } from './offensive-to-enemy-low-life-ai-scenario';

describe('offensive to enemy low life AI scenario', () => {
    it('run scenario [simpleAttack] when enemy is close', async () => {

        const { firstStates, battle, service } = getAITestEntities({
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
            service.executeTurn(battle, 'c4', {
                scenarioList: [offensiveToEnemyLowLifeAIScenario]
            })
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
