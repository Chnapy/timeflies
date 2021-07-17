import { createAIScenario } from '../ai-scenario';

/**
 * - [offensive] if enemy targetable
 *  execute
 */
export const offensiveToEnemyAIScenario = createAIScenario(async ({
    staticSpells, currentState,
    enemyList,
    utils,
    applySpellAction
}) => {
    for (const { spellId } of staticSpells.offensive) {

        const targetList = utils.getTargetableList(enemyList, spellId);
        if (targetList.length) {

            const target = utils.getCharacterWithLowestHealth(targetList);
            if (target) {

                const targetPos = currentState.characters.position[ target.characterId ];

                const success = await applySpellAction(spellId, targetPos);

                if (success) {
                    return true;
                }
            }
        }
    }

    return false;
});
