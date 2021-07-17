import { createAIScenario } from '../ai-scenario';

/**
 * - [placement] if enemy somewhere
 *  move to closest tile [target=enemy] (max distance 3)
 */
export const placementToEnemyAIScenario = createAIScenario(async ({
    battle, currentCharacter, staticSpells, currentState, stateEndTime, enemyList,
    utils,
    applySpellAction
}) => {
    for (const { spellId } of staticSpells.placement) {

        const { spellRole } = battle.staticState.spells[ spellId ];

        const closestEnemy = utils.getClosestCharacterListFromList(enemyList)[0];
        if (!closestEnemy) {
            return false;
        }

        if (spellRole === 'move') {
            const turnEndTime = battle.currentTurnInfos!.startTime + currentState.characters.actionTime[ currentCharacter.characterId ];
            const remainingTime = turnEndTime - stateEndTime;

            const maxDistance = Math.min(
                Math.floor(remainingTime / currentState.spells.duration[ spellId ]),
                3
            );

            const potentialTargets = utils.getClosestRangeTilesToTarget(spellId, closestEnemy, {
                maxDistance,
                ignoreDistanceNull: true
            });

            for (const { pos: targetPos, distanceFromLauncher } of potentialTargets) {
                const success = await applySpellAction(spellId, targetPos, distanceFromLauncher);

                if (success) {
                    return true;
                }
            }
        } else {

            const potentialTargets = utils.getClosestRangeTilesToTarget(spellId, closestEnemy, {
                ignoreDistanceNull: true
            });

            for (const { pos: targetPos } of potentialTargets) {
                const success = await applySpellAction(spellId, targetPos);

                if (success) {
                    return true;
                }
            }
        }
    }

    return false;
});
