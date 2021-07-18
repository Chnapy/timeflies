import { SpellEffectItem } from '../spell-effects-fn';

/**
 * Move also in diagonal. If any other character, exchange position.
 */
export const switchEffect: SpellEffectItem = {
    rangeArea: (position, { playingCharacterId, charactersPositions }) => {
        const characterPosition = charactersPositions[ playingCharacterId ];
        if(characterPosition.id === position.id) {
            return false;
        }

        const dx = Math.abs(characterPosition.x - position.x);
        const dy = Math.abs(characterPosition.y - position.y);

        return dx <= 1 && dy <= 1;
    },
    effect: async ({
        getLauncher, getHitCharactersAlive,
        targetPos
    }) => {
        const launcher = getLauncher();

        const target = getHitCharactersAlive()[ 0 ];

        const launcherFirstPosition = launcher.position;

        const targetEffects = target
            ? {
                [ target.characterId ]: {
                    position: launcherFirstPosition
                }
            }
            : {};

        return {
            characters: {
                [ launcher.characterId ]: {
                    position: targetPos
                },
                ...targetEffects
            }
        };
    }
};
