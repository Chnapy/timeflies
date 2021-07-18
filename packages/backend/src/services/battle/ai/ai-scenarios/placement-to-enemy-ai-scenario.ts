import { createAIScenario } from '../ai-scenario';

/**
 * - [placement] if enemy somewhere
 *  move to closest tile [target=enemy] (max distance 3)
 */
export const placementToEnemyAIScenario = createAIScenario(async ({
    battle, currentCharacter, staticSpells, getCurrentState, stateEndTime, enemyList,
    utils,
    simulateSpellAction
}) => {
    for (const { spellId } of staticSpells.placement) {

        const { spellRole } = battle.staticState.spells[ spellId ];

        const closestEnemy = utils.getClosestCharacterListFromList(enemyList)[0];
        if (!closestEnemy) {
            return false;
        }

        if (spellRole === 'move') {
            const turnEndTime = battle.currentTurnInfos!.startTime + getCurrentState().characters.actionTime[ currentCharacter.characterId ];
            const remainingTime = turnEndTime - stateEndTime;

            const maxDistance = Math.min(
                Math.floor(remainingTime / getCurrentState().spells.duration[ spellId ]),
                3
            );

            const potentialTargets = utils.getClosestRangeTilesToTarget(spellId, closestEnemy, {
                maxDistance,
                ignoreDistanceNull: true
            });

            for (const { pos: targetPos, distanceFromLauncher } of potentialTargets) {
                const simulateSuccess = await simulateSpellAction(spellId, targetPos, {
                    multiplyDurationBy: distanceFromLauncher
                });
                if (simulateSuccess) {
                    simulateSuccess.execute();
                    return true;
                }
            }
        } else {

            const potentialTargets = utils.getClosestRangeTilesToTarget(spellId, closestEnemy, {
                ignoreDistanceNull: true
            });

            for (const { pos: targetPos } of potentialTargets) {
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
