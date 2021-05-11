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

    type FramesDurations = {
        [ state in CharacterSpriteConfig[ 'state' ] ]: {
            [ orientation in CharacterSpriteConfig[ 'orientation' ] ]?: number[];
        } & {
            default?: number[];
        };
    };

    const defaultFrameDuration = [ 400 ];
    const defaultFramesDurations: FramesDurations = {
        idle: {
            bottom: [ 640, 80, 640 ],
            default: [ 940, 820 ]
        },
        walk: { default: [ 100 ] },
        attack: {
            default: [ 300, 100, 100, 200 ]
        },
        hit: {
            default: [ 360, 80, 80, 80, 50, 50 ]
        }
    };

    const framesDurationsMap: {
        [ role in CharacterSpriteConfig[ 'role' ] ]: FramesDurations
    } = {
        tacka: defaultFramesDurations,
        meti: defaultFramesDurations,
        vemo: defaultFramesDurations
    };

    export const getCharacterFramesDurations = ({
        role, state, orientation
    }: CharacterSpriteConfig): number[] => {

        const lvRole = framesDurationsMap[ role ];
        const lvState = lvRole[ state ];

        return lvState[ orientation ] ?? lvState.default ?? defaultFrameDuration;
    };

    export const getCharacterFramesOrder = ({ state }: CharacterSpriteConfig) => {
        if (state === 'hit') {
            return [ 1, 2, 3, 2, 3, 4 ];
        }
    };

    type CharacterFlipInfos = {
        direction: 'horizontal' | 'vertical';
        flipConfig: CharacterSpriteConfig
    };

    export const getCharacterFlipInfos = (config: CharacterSpriteConfig): CharacterFlipInfos | null => {
        return config.orientation === 'left'
            ? {
                direction: 'horizontal',
                flipConfig: {
                    ...config,
                    orientation: 'right'
                }
            }
            : null;
    };
}
