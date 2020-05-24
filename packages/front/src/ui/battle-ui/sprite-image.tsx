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
    orig?: PIXI.Rectangle;
};

const useStyles = makeStyles(() => ({
    root: ({ size }: StyleProps) => ({
        width: size,
        height: size,
        overflow: 'hidden'
    }),
    background: ({ url, size, orig }: StyleProps) => (url && orig)
        ? {
            backgroundImage: `url(${url})`,
            backgroundPosition: `${-orig.x}px ${-orig.y}px`,
            backgroundRepeat: 'no-repeat',
            width: orig.width,
            height: orig.height,
            transformOrigin: '0 0',
            transform: `scale(${size / orig.width})`
        }
        : {}
}));

const getStyleProps = (asset: LoaderResourceSpritesheet | undefined, textureKey: string, size: number): StyleProps => {

    const url = asset?.resource.url;
    const texture: PIXI.Texture | undefined = asset?.spritesheet.textures[ textureKey ];
    const orig = texture?.orig;

    return {
        size,
        url,
        orig
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
