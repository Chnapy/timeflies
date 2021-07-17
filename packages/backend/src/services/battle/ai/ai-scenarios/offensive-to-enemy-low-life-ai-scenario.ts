import { createAIScenario } from '../ai-scenario';

/**
 * - [offensive] if enemy low life (<33%) targetable
 *  execute
 */
export const offensiveToEnemyLowLifeAIScenario = createAIScenario(async ({
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

                const healthPercent = utils.getStateVariablePercent(state => state.characters.health[ target.characterId ]);
                if (healthPercent < 0.33) {

                    const targetPos = currentState.characters.position[ target.characterId ];

                    const success = await applySpellAction(spellId, targetPos);

                    if (success) {
                        return true;
                    }

                }
            }
        }
    }

    return false;
});
