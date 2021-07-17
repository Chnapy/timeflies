import { createAIScenario } from '../ai-scenario';

/**
 * - [support] if ally targetable & no support spell used before
 *  execute
 */
export const supportAllyOnceAIScenario = createAIScenario(async ({
    staticSpells, currentState,
    allyList,
    nbrScenarioUses,
    utils,
    applySpellAction
}) => {
    if (nbrScenarioUses) {
        return false;
    }

    for (const { spellId } of staticSpells.support) {

        const targetList = utils.getTargetableList(allyList, spellId);
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
