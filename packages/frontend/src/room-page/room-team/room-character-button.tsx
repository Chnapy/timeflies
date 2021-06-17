import { makeStyles } from '@material-ui/core';
import { UIButton, UIButtonProps } from '@timeflies/app-ui';
import { CharacterCategory, CharacterId, getCharacterCategory } from '@timeflies/common';
import { CharacterAnimatedImage } from '@timeflies/sprite-image';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import clsx from 'clsx';
import React from 'react';
import { useRoomSelector } from '../hooks/use-room-selector';

type RoomCharacterButtonProps = Omit<UIButtonProps, 'size'> & {
    characterId: CharacterId;
    size?: number;
    borderWidth?: number;
    scale?: number;
    showOutline?: boolean;
};

type StyleProps = {
    size: number;
    borderWidth: number;
    showOutline: boolean;
    characterCategory: CharacterCategory;
};

const useStyles = makeStyles(({ palette }) => ({
    root: ({ size, borderWidth, showOutline, characterCategory }: StyleProps) => ({
        width: size,
        height: size,
        minWidth: 0,
        padding: 0,
        paddingTop: '8px',
        borderLeftWidth: borderWidth,
        borderLeftStyle: 'solid',
        borderLeftColor: palette.spellCategories[ characterCategory ],
        outlineStyle: 'solid',
        outlineWidth: showOutline ? 2 : 0
    })
}));

export const RoomCharacterButton: React.FC<RoomCharacterButtonProps> = React.memo(({
    characterId,
    size = 48,
    borderWidth = 4,
    scale = 2,
    showOutline = false,
    className,
    ...rest
}) => {
    const characterRole = useRoomSelector(state => state.staticCharacterList[ characterId ].characterRole);

    const characterCategory = getCharacterCategory(characterRole);
    const classes = useStyles({ size, borderWidth, showOutline, characterCategory });

    const spriteConfig: SpritesheetsUtils.CharacterSpriteConfig = {
        role: characterRole,
        orientation: 'bottom',
        state: 'idle'
    };

    return (
        <UIButton className={clsx(classes.root, className)} {...rest}>
            <CharacterAnimatedImage
                size={size - borderWidth}
                scale={scale}
                animationPath={SpritesheetsUtils.getCharacterAnimationPath(spriteConfig)}
                framesDurations={SpritesheetsUtils.getCharacterFramesDurations(spriteConfig)}
                framesOrder={SpritesheetsUtils.getCharacterFramesOrder(spriteConfig)}
                pingPong
            />
        </UIButton>
    );
});
