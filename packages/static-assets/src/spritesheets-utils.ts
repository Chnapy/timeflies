import { CharacterRole, Orientation, SpellRole } from '@timeflies/common';

export module SpritesheetsUtils {

    export const characterSpriteStateList = [ 'idle', 'walk', 'attack', 'hit' ] as const;
    export type CharacterSpriteState = typeof characterSpriteStateList[ number ];

    export const getSpellTextureKey = (spellRole: SpellRole) => `spells/${spellRole}.png`;

    export const getCharacterAnimationPath = ({
        role, state, orientation
    }: CharacterSpriteConfig) => `characters/${role}/${state}/${orientation}/${role}_${state}_${orientation}`;

    export type CharacterSpriteConfig = {
        role: CharacterRole;
        state: CharacterSpriteState;
        orientation: Orientation;
    };

    const defaultFrameDuration = [ 400 ];
    const framesDurations: {
        [ role in CharacterSpriteConfig[ 'role' ] ]?: {
            [ state in CharacterSpriteConfig[ 'state' ] ]?: {
                [ orientation in CharacterSpriteConfig[ 'orientation' ] ]?: number[];
            } & {
                default?: number[];
            };
        }
    } = {
        tacka: {
            idle: {
                bottom: [ 640, 80, 640 ],
                default: [ 940, 820 ]
            },
            walk: { default: [ 100 ] },
            attack: {
                default: [ 300, 100, 100, 200 ]
            },
            hit: {
                default: [ 120, 80, 80, 80, 80, 120 ]
            }
        }
    };

    export const getCharacterFramesDurations = ({
        role, state, orientation
    }: CharacterSpriteConfig): number[] => {

        const lvRole = framesDurations[ role ];
        const lvState = lvRole && lvRole[ state ];
        if (lvState) {
            return lvState[ orientation ] ?? lvState.default ?? defaultFrameDuration;
        }

        return defaultFrameDuration;
    };
}
