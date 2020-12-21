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
                state={{
                    role: 'tacka',
                    state: 'idle',
                    orientation: 'bottom'
                }}
                getFramesInfos={state => {
                    const animationPath = SpritesheetsUtils.getCharacterAnimationPath(state);

                    const framesDurations = SpritesheetsUtils.getCharacterFramesDurations(state);

                    return {
                        animationPath,
                        framesDurations,
                        pingPong: true
                    };
                }}
            />
        </AssetsLoader>
    );
};
