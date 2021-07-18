import { createPosition, SerializableState } from '@timeflies/common';
import { timerTester } from '@timeflies/devtools';
import { getAITestEntities } from '../ai-scenario-test-utils';
import { supportAllyOnceAIScenario } from './support-ally-once-ai-scenario';

describe('support ally once AI scenario', () => {
    it('run scenario [motivation] when ally is close', async () => {

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
            service.executeTurn(battle, 'c4', {
                scenarioList: [ supportAllyOnceAIScenario ]
            })
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
