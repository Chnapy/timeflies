import { createAIScenario } from '../ai-scenario';

/**
 * - [support] if ally targetable & no support spell used before
 *  execute
 */
export const supportAllyOnceAIScenario = createAIScenario(async ({
    staticSpells, getCurrentState,
    allyList,
    nbrScenarioUses,
    utils,
    simulateSpellAction
}) => {
    if (nbrScenarioUses) {
        return false;
    }

    for (const { spellId } of staticSpells.support) {

        const targetList = utils.getTargetableList(allyList, spellId);
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
