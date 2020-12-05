import { SpellEffectFn } from '../spell-effects-fn';

export const switchEffect: SpellEffectFn = ({ 
    getLauncher, getHitCharactersAlive,
    targetPos
 }) => {
    const launcher = getLauncher();

    const target = getHitCharactersAlive()[0];

    const launcherFirstPosition = launcher.position;

    const targetEffects = target
        ? {
            [target.id]: {
                position: launcherFirstPosition
            }
        }
        : {};

    return {
        characters: {
            [launcher.id]: {
                position: targetPos
            },
            ...targetEffects
        }
    };
};
