import { createAIScenario } from '../ai-scenario';

/**
 * - [offensive] if enemy targetable
 *  execute
 */
export const offensiveToEnemyAIScenario = createAIScenario(async ({
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

                const targetPos = getCurrentState().characters.position[ target.characterId ];

                const simulateSuccess = await simulateSpellAction(spellId, targetPos);
                if (simulateSuccess) {
                    simulateSuccess.execute();
                    return true;
                }
            }
        }
    }

    return false;
});
