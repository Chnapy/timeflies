import { makeStyles } from '@material-ui/core/styles';
import { LoaderResourceSpritesheet, useAssetSpritesheet } from '@timeflies/assets-loader';
import clsx from 'clsx';
import { Rectangle, Texture } from 'pixi.js';
import React from 'react';


export type SpriteImageProps = {
    textureKey: string;
    size: number;
    fallback?: React.ReactNode;
};

type StyleProps = {
    size: number;
    url?: string;
    frame?: Rectangle;
    rotate: boolean;
};

const useStyles = makeStyles(() => ({
    root: ({ size }: StyleProps) => ({
        position: 'relative',
        width: size,
        height: size,
        overflow: 'hidden'
    }),
    background: ({ url, size, frame, rotate }: StyleProps) => {

        if (!url || !frame) {
            return {};
        }

        const ratioX = size / frame.width;
        const ratioY = size / frame.height;

        const scale = Math.min(ratioX, ratioY);

        const transform = rotate
            ? `scale(${scale}) translate(${-frame.height / 2}px, ${frame.width / 2}px) rotate(-90deg)`
            : `scale(${scale}) translate(-50%, -50%)`;

        return {
            position: 'absolute',
            left: '50%',
            top: '50%',
            backgroundImage: `url(${url})`,
            backgroundPosition: `${-frame.x}px ${-frame.y}px`,
            backgroundRepeat: 'no-repeat',
            width: frame.width,
            height: frame.height,
            transformOrigin: '0 0',
            transform,
            margin: 'auto',
            imageRendering: 'pixelated'
        };
    },

    // workaround for image-rendering issue in Firefox
    backgroundMoz: {
        imageRendering: 'crisp-edges'
    }
}));

const getStyleProps = (asset: LoaderResourceSpritesheet | undefined, textureKey: string, size: number): StyleProps => {

    const url = asset?.spritesheetUrl;
    const texture: Texture | undefined = asset?.spritesheet.textures[ textureKey ];
    const frame = texture?.frame;
    const rotate = !!texture?.rotate;

    return {
        size,
        url,
        frame,
        rotate
    };
};

export const SpriteImage: React.FC<SpriteImageProps> = React.memo(({ textureKey, size, fallback }) => {

    const asset = useAssetSpritesheet('entities');

    const classes = useStyles(
        getStyleProps(asset, textureKey, size)
    );

    return (
        <div className={classes.root}>
            {asset ?
                <div className={clsx(classes.background, classes.backgroundMoz)} />
                : fallback}
        </div>
    );
});
