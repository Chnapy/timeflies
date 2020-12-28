import { Meta } from '@storybook/react/types-6-0';
import { AssetsLoader } from '@timeflies/assets-loader';
import React from 'react';
import { CharacterAnimatedImage } from './character-animated-image';
import { SpellImage } from './spell-image';
import { SpriteImage } from './sprite-image';
import { Assets, SpritesheetsUtils } from '@timeflies/static-assets';
import { settings, SCALE_MODES } from 'pixi.js';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

export default {
    title: 'sprite-image'
} as Meta;

export const Default = () => {

    const state: SpritesheetsUtils.CharacterSpriteConfig = {
        role: 'tacka',
        state: 'idle',
        orientation: 'bottom'
    };

    const animationPath = SpritesheetsUtils.getCharacterAnimationPath(state);

    const framesDurations = SpritesheetsUtils.getCharacterFramesDurations(state);

    return (
        <AssetsLoader
            spritesheets={Assets.spritesheets}
            maps={{}}
        >
            <SpriteImage
                textureKey={SpritesheetsUtils.getSpellTextureKey('switch')}
                size={48}
                fallback='loading...'
            />

            <SpellImage spellRole='move' size={48} fallback='loading...' />

            <CharacterAnimatedImage
                size={48}
                scale={2}
                fallback='loading...'
                animationPath={animationPath}
                framesDurations={framesDurations}
                pingPong
            />
        </AssetsLoader>
    );
};
