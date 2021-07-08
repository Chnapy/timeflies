import { AnimatedComplexSpriteProps } from '@timeflies/animated-complex-sprite';
import { useSound } from '@timeflies/app-ui';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import React from 'react';

export const useSpriteFrameChangeSounds = ({ role, state }: SpritesheetsUtils.CharacterSpriteConfig): AnimatedComplexSpriteProps[ 'onFrameChange' ] => {
    const playSound = useSound();

    return React.useCallback((currentFrame, textureIndex) => {
        if (state === 'walk') {
            if (currentFrame % 2 === 1) {
                if (role === 'meti') {
                    playSound('characterWalkSlime');
                } else {
                    playSound('characterWalkNormal');
                }
            }
        } else if (state === 'attack') {
            if (role === 'tacka') {
                if (currentFrame === 1) {
                    playSound('characterAttackSword');
                }
            }
        } else if (state === 'hit') {
            if (currentFrame === 1) {
                playSound('characterHit');
            }
        }
    }, [ playSound, role, state ]);
};
