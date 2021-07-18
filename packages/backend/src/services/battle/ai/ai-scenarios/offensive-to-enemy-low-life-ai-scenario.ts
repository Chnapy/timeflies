import { createAIScenario } from '../ai-scenario';

/**
 * - [offensive] if enemy low life (<33%) targetable
 *  execute
 */
export const offensiveToEnemyLowLifeAIScenario = createAIScenario(async ({
    staticSpells, getCurrentState,
    enemyList,
    utils,
    simulateSpellAction
}) => {
    for (const { spellId } of staticSpells.offensive) {

        const targetList = utils.getTargetableList(enemyList, spellId);
        if (targetList.length) {

            const target = utils.getCharacterWithLowestHealth(targetList);
            if (target) {

                const healthPercent = utils.getStateVariablePercent(state => state.characters.health[ target.characterId ]);
                if (healthPercent < 0.33) {

                    const targetPos = getCurrentState().characters.position[ target.characterId ];

                    const simulateSuccess = await simulateSpellAction(spellId, targetPos);
                    if (simulateSuccess) {
                        simulateSuccess.execute();
                        return true;
                    }

                }
            }
        }
    }

    return false;
});
