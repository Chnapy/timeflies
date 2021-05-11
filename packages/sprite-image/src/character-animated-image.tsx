import { AnimatedComplexSpriteProps, AnimatedComplexSpriteReact } from '@timeflies/animated-complex-sprite';
import { useAssetSpritesheet } from '@timeflies/assets-loader';
import React from 'react';
import { Stage } from 'react-pixi-fiber';

export type CharacterAnimatedImageProps = Omit<AnimatedComplexSpriteProps, 'spritesheet'> & {
    size: number;
    scale?: number;
    fallback?: React.ReactNode;
};

export const CharacterAnimatedImage: React.FC<CharacterAnimatedImageProps> = ({
    size, scale, fallback, ...spriteProps
}) => {
    const asset = useAssetSpritesheet('entities');

    if (!asset) {
        return <>{fallback}</>;
    }

    return <Stage options={{
        width: size,
        height: size,
        backgroundAlpha: 0
    }}>
        <AnimatedComplexSpriteReact
            spritesheet={asset.spritesheet}
            {...spriteProps}
            scale={scale}
            anchor={0.5}
            position={size / 2}
        />
    </Stage>
};
