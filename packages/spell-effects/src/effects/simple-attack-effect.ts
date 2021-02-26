import { SpellEffectFn } from '../spell-effects-fn';
import { SpellEffectCharacters } from '../spell-effects-params';

export const simpleAttackEffect: SpellEffectFn = async ({
    getHitCharactersAlive, getSpell
}) => {

    const targets = getHitCharactersAlive();

    const { attack = 0 } = getSpell();

    const characters = targets.reduce<SpellEffectCharacters>((acc, v) => {
        acc[ v.characterId ] = {
            health: -attack
        };
        return acc;
    }, {});

    return {
        characters
    };
};
