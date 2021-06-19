import { createPosition, getOrientationFromTo, Position, switchUtil } from '@timeflies/common';
import { SpellEffectItem } from '../spell-effects-fn';
import { SpellEffectCharacters } from '../spell-effects-params';

/**
 * Attract target to 3 tiles. Change its orientation toward launcher.
 */
export const attractionEffect: SpellEffectItem = {
    effect: async ({
        getHitCharactersAlive, targetPos, getLauncher, isPositionAccessible
    }) => {
        const launcher = getLauncher();

        const targets = getHitCharactersAlive();

        const characters = targets.reduce<SpellEffectCharacters>((acc, target) => {

            const orientFromTarget = getOrientationFromTo(target.position, launcher.position);

            acc[ target.characterId ] = {
                orientation: orientFromTarget
            };

            const getNextPosition = switchUtil(orientFromTarget, {
                bottom: ({ x, y }: Position) => createPosition(x, y + 1),
                top: ({ x, y }: Position) => createPosition(x, y - 1),
                left: ({ x, y }: Position) => createPosition(x - 1, y),
                right: ({ x, y }: Position) => createPosition(x + 1, y),
            });

            for (let i = 0; i < 3; i++) {
                const nextPosition = getNextPosition(acc[ target.characterId ].position ?? target.position);

                if (!isPositionAccessible(nextPosition)) {
                    break;
                }

                acc[ target.characterId ].position = nextPosition;
            }

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
