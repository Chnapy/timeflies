import { getOrientationFromTo } from '@timeflies/common';
import { SpellEffectItem } from '../spell-effects-fn';
import { SpellEffectCharacters } from '../spell-effects-params';

/**
 * Boost targets time permanently (0.3s).
 */
export const motivationEffect: SpellEffectItem = {
    effect: async ({
        getHitCharactersAlive, targetPos, getLauncher
    }) => {
        const launcher = getLauncher();

        const targets = getHitCharactersAlive();

        const characters = targets.reduce<SpellEffectCharacters>((acc, v) => {

            acc[ v.characterId ] = {
                actionTime: 300
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
