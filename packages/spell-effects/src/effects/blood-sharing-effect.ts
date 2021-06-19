import { SpellEffectItem } from '../spell-effects-fn';
import { SpellEffectCharacters } from '../spell-effects-params';

/**
 * Launcher loses 15hp and health its targets to same value.
 */
export const bloodSharingEffect: SpellEffectItem = {
    effect: async ({
        getHitCharactersAlive, getSpell, getLauncher
    }) => {
        const launcher = getLauncher();

        const targets = getHitCharactersAlive();

        const { attack = 0 } = getSpell();

        const finalAttack = Math.min(attack, launcher.health);

        const characters = targets.reduce<SpellEffectCharacters>((acc, v) => {

            if (v.characterId === launcher.characterId) {

                acc[ v.characterId ] = {
                    health: -finalAttack
                };
            } else {

                acc[ v.characterId ] = {
                    health: finalAttack
                };
            }
            return acc;
        }, {});

        return {
            characters
        };
    }
};
