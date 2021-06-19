import { getOrientationFromTo } from '@timeflies/common';
import { SpellEffectItem } from '../spell-effects-fn';
import { SpellEffectCharacters } from '../spell-effects-params';

/**
 * Attack and remove time permanently (0.2s).
 */
export const slumpEffect: SpellEffectItem = {
    effect: async ({
        getHitCharactersAlive, getSpell, targetPos, getLauncher
    }) => {
        const launcher = getLauncher();

        const targets = getHitCharactersAlive();

        const { attack = 0 } = getSpell();

        const characters = targets.reduce<SpellEffectCharacters>((acc, v) => {

            acc[ v.characterId ] = {
                health: -attack,
                actionTime: -200
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
