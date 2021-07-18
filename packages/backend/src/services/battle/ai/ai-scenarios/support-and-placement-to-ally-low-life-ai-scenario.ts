import { SpellId } from '@timeflies/common';
import { AIScenarioProps, createAIScenario } from '../ai-scenario';

/**
 * - [support/placement] if ally low life (<33%) somewhere
 *  - try to heal close ally low life
 *      - cancel all chain if no heal spell
 *  - if failed, move to closest tile to target
 *      - cancel all chain if failed
 *  - redo
 */
export const supportAndPlacementToAllyLowLifeAIScenario = createAIScenario(async props => {

    const supportResult = await supportAllyLowLife(props);
    if (supportResult === 'no-heal-spell') {
        return false;
    }

    if (supportResult) {
        return true;
    }

    return await placementToAllyLowLife(props);
});

const supportAllyLowLife = async ({
    staticSpells, getCurrentState,
    allyList,
    utils,
    simulateSpellAction
}: AIScenarioProps) => {
    const spellIdDoNotHeal: SpellId[] = [];

    for (const { spellId } of staticSpells.support) {

        const targetList = utils.getTargetableList(allyList, spellId);
        if (targetList.length) {

            const target = utils.getCharacterWithLowestHealth(targetList);
            if (target) {

                const healthPercent = utils.getStateVariablePercent(state => state.characters.health[ target.characterId ]);
                if (healthPercent < 0.33) {

                    const targetPos = getCurrentState().characters.position[ target.characterId ];

                    const simulateSuccess = await simulateSpellAction(spellId, targetPos);
                    if (simulateSuccess) {
                        const { spellEffect } = simulateSuccess.simulation;

                        if (spellEffect.characters && (spellEffect.characters[ target.characterId ].health ?? 0) > 0) {
                            simulateSuccess.execute();
                            return true;
                        } else {
                            spellIdDoNotHeal.push(spellId);
                        }
                    }
                }
            }
        }
    }

    if (spellIdDoNotHeal.length === staticSpells.support.length) {
        return 'no-heal-spell';
    }

    return false;
};

const placementToAllyLowLife = createAIScenario(async ({
    battle, currentCharacter, staticSpells, getCurrentState, stateEndTime, allyList,
    utils,
    simulateSpellAction
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
            const turnEndTime = battle.currentTurnInfos!.startTime + getCurrentState().characters.actionTime[ currentCharacter.characterId ];
            const remainingTime = turnEndTime - stateEndTime;

            const maxDistance = Math.min(
                Math.floor(remainingTime / getCurrentState().spells.duration[ spellId ]),
                3
            );

            const potentialTargets = utils.getClosestRangeTilesToTarget(spellId, allyLowLife, {
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

            const potentialTargets = utils.getClosestRangeTilesToTarget(spellId, allyLowLife, {
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
