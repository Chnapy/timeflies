import { getOrientationFromTo } from '@timeflies/common';
import { SpellEffectItem } from '../spell-effects-fn';
import { SpellEffectCharacters } from '../spell-effects-params';

/**
 * Attack target, damages x2 if target is on the side.
 * Change target orientation to be front of launcher.
 */
export const sideAttackEffect: SpellEffectItem = {
    effect: async ({
        getHitCharactersAlive, getSpell, targetPos, getLauncher
    }) => {
        const launcher = getLauncher();

        const targets = getHitCharactersAlive();

        const { attack = 0 } = getSpell();

        const characters = targets.reduce<SpellEffectCharacters>((acc, v) => {
            const orientFromTarget = getOrientationFromTo(v.position, launcher.position);
            const orientFromLauncher = getOrientationFromTo(launcher.position, v.position);

            const finalAttack = [ orientFromTarget, orientFromLauncher ].includes(v.orientation)
                ? attack
                : attack * 2;

            acc[ v.characterId ] = {
                health: -finalAttack,
                orientation: orientFromTarget
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
