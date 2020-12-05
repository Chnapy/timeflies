import { getOrientationFromTo } from '@timeflies/common';
import { SpellEffectFn } from '../spell-effects-fn';

export const moveEffect: SpellEffectFn = ({
    getLauncher,
    targetPos
}) => {
    const launcher = getLauncher();

    const orientation = getOrientationFromTo(launcher.position, targetPos);

    return {
        characters: {
            [ launcher.id ]: {
                position: targetPos,
                orientation
            }
        }
    };
};
