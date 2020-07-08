import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { LoaderResourceSpritesheet, SpritesheetMapKey } from '../../assetManager/AssetLoader';
import { useAsset } from '../../assetManager/AssetProvider';


export type SpriteImageProps = {
    spritesheetKey: SpritesheetMapKey;
    textureKey: string;
    size: number;
    placeholder?: React.ReactNode;
};

type StyleProps = {
    size: number;
    url?: string;
    frame?: PIXI.Rectangle;
};

const useStyles = makeStyles(() => ({
    root: ({ size }: StyleProps) => ({
        position: 'relative',
        width: size,
        height: size,
        overflow: 'hidden'
    }),
    background: ({ url, size, frame }: StyleProps) => {

        if (!url || !frame) {
            return {};
        }

        const ratioX = size / frame.width;
        const ratioY = size / frame.height;

        const scale = Math.min(ratioX, ratioY);

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
            transform: `scale(${scale}) translate(-50%, -50%)`,
            margin: 'auto',
            imageRendering: 'pixelated'
        };
    }
}));

const getStyleProps = (asset: LoaderResourceSpritesheet | undefined, textureKey: string, size: number): StyleProps => {

    const url = asset?.resource.url;
    const texture: PIXI.Texture | undefined = asset?.spritesheet.textures[ textureKey ];
    const frame = texture?.frame;

    return {
        size,
        url,
        frame
    };
};

export const SpriteImage: React.FC<SpriteImageProps> = React.memo(({ spritesheetKey, textureKey, size, placeholder }) => {

    const asset = useAsset(spritesheetKey);

    const classes = useStyles(
        getStyleProps(asset, textureKey, size)
    );

    return React.useMemo(() => {

        return (
            <div className={classes.root}>
                {asset ?
                    <div className={classes.background} />
                    : placeholder}
            </div>
        );
    }, [ classes.root, classes.background, asset, placeholder ]);
});
