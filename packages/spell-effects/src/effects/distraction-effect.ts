import { getOrientationFromTo } from '@timeflies/common';
import { SpellEffectItem } from '../spell-effects-fn';
import { SpellEffectCharacters } from '../spell-effects-params';

/**
 * Change targets orientation to middle of action area.
 */
export const distractionEffect: SpellEffectItem = {
    effect: async ({
        getHitCharactersAlive, targetPos, getLauncher
    }) => {
        const launcher = getLauncher();

        const targets = getHitCharactersAlive();

        const characters = targets.reduce<SpellEffectCharacters>((acc, target) => {

            const orientFromTargetToMiddle = getOrientationFromTo(target.position, targetPos);

            acc[ target.characterId ] = {
                orientation: orientFromTargetToMiddle
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
