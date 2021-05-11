import { SpellEffectItem } from '../spell-effects-fn';

export const switchEffect: SpellEffectItem = {
    rangeArea: (position, { playingCharacterId, charactersPositions }) => {
        const characterPosition = charactersPositions[ playingCharacterId ];

        const dx = Math.abs(characterPosition.x - position.x);
        const dy = Math.abs(characterPosition.y - position.y);

        return dx === dy;
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
