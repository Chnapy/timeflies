import { getOrientationFromTo } from '@timeflies/common';
import { SpellEffectItem } from '../spell-effects-fn';
import { SpellEffectCharacters, SpellEffectSpells } from '../spell-effects-params';

/**
 * Attack and regen life to half of damages. Increase spell attack (+2).
 */
export const swordStingEffect: SpellEffectItem = {
    effect: async ({
        getHitCharactersAlive, getSpell, targetPos, getLauncher
    }) => {
        const launcher = getLauncher();

        const targets = getHitCharactersAlive();

        const { spellId, attack = 0 } = getSpell();

        let damages = 0;
        const characters = targets.reduce<SpellEffectCharacters>((acc, v) => {
            acc[ v.characterId ] = {
                health: -attack
            };
            damages += attack;
            return acc;
        }, {});

        const heal = Math.floor(damages / 2);

        const orientation = getOrientationFromTo(launcher.position, targetPos);

        characters[ launcher.characterId ] = {
            ...characters[ launcher.characterId ],
            orientation,
            health: heal
        };

        const spells: SpellEffectSpells = targets.length
            ? {
                [ spellId ]: {
                    attack: 2
                }
            }
            : {};

        return {
            characters,
            spells
        };
    }
};
