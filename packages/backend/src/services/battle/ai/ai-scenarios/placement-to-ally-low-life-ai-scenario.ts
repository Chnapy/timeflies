import { createAIScenario } from '../ai-scenario';

/**
 * - [placement] if ally low life (<33%) somewhere
 *  move to closest tile [target=ally] (with max distance)
 */
export const placementToAllyLowLifeAIScenario = createAIScenario(async ({
    battle, currentCharacter, staticSpells, currentState, stateEndTime, allyList,
    utils,
    applySpellAction
}) => {
    for (const { spellId } of staticSpells.placement) {

        const { spellRole } = battle.staticState.spells[ spellId ];

        const closestAllies = utils.getClosestCharacterListFromList(allyList);

        const allyLowLife = closestAllies.find(({ characterId }) =>
            utils.getStateVariablePercent(({ characters }) => characters.health[ characterId ]) < 0.33
        );
        if (!allyLowLife) {
            return false;
        }

        if (spellRole === 'move') {
            const turnEndTime = battle.currentTurnInfos!.startTime + currentState.characters.actionTime[ currentCharacter.characterId ];
            const remainingTime = turnEndTime - stateEndTime;

            const maxDistance = Math.min(
                Math.floor(remainingTime / currentState.spells.duration[ spellId ]),
                3
            );

            const potentialTargets = utils.getClosestRangeTilesToTarget(spellId, allyLowLife, {
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

            const potentialTargets = utils.getClosestRangeTilesToTarget(spellId, allyLowLife, {
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
