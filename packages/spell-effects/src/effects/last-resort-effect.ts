import { getOrientationFromTo } from '@timeflies/common';
import { SpellEffectItem } from '../spell-effects-fn';
import { SpellEffectCharacters } from '../spell-effects-params';

/**
 * Attack depending to remaining time (attack x1 to x10).
 */
export const lastResortEffect: SpellEffectItem = {
    effect: async ({
        getHitCharactersAlive, getSpell, targetPos, getLauncher, params
    }) => {
        const launcher = getLauncher();

        const targets = getHitCharactersAlive();

        const { attack = 0, duration } = getSpell();

        const { currentTurn } = params.context;
        const { launchTime } = params.partialSpellAction;

        const spellEndTime = launchTime + duration;

        const totalTime = launcher.actionTime;
        const elapsedTime = spellEndTime - currentTurn.startTime;
        const remainingTime = totalTime - elapsedTime;

        const ratio = 1 - remainingTime / totalTime;

        const maxExpRatio = Math.exp(1) - Math.exp(0);
        const expRatio = (Math.exp(ratio) - Math.exp(0)) / maxExpRatio;

        const multiplicator = 10;

        const finalAttack = Math.floor(attack + attack * expRatio * (multiplicator - 1));

        const characters = targets.reduce<SpellEffectCharacters>((acc, v) => {

            acc[ v.characterId ] = {
                health: -finalAttack
            };
            return acc;
        }, {});

        const orientation = getOrientationFromTo(launcher.position, targetPos);

        characters[ launcher.characterId ] = {
            ...characters[ launcher.characterId ],
            orientation
        };

        return {
            characters
        };
    }
};
