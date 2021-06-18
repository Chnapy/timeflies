import { createPosition, getOrientationFromTo, Position, switchUtil } from '@timeflies/common';
import { SpellEffectItem } from '../spell-effects-fn';
import { SpellEffectCharacters } from '../spell-effects-params';

/**
 * If enemy: attack target, damages x2.5 if target is on the back. 
 * It push back target to 3 tiles and change target orientation to be front of launcher.
 */
export const treacherousBlowEffect: SpellEffectItem = {
    effect: async ({
        getHitCharactersAlive, getSpell, targetPos, getLauncher, isPositionAccessible
    }) => {
        const launcher = getLauncher();

        const targets = getHitCharactersAlive();

        const { attack = 0 } = getSpell();

        const characters = targets.reduce<SpellEffectCharacters>((acc, target) => {

            const orientFromTarget = getOrientationFromTo(target.position, launcher.position);
            const orientFromLauncher = getOrientationFromTo(launcher.position, target.position);

            acc[ target.characterId ] = {
                orientation: orientFromTarget
            };

            const getNextPosition = switchUtil(orientFromLauncher, {
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

            if (target.getRelation() === 'enemy') {
                const finalAttack = orientFromLauncher === target.orientation
                    ? attack * 2.5
                    : attack;

                acc[ target.characterId ].health = -finalAttack;
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
